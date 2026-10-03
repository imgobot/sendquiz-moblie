import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { t as translate } from '../constants/i18n';
import type { QuizChat, QuizItem } from '../services/quizApi';
import {
  createAccessibleQuizChat,
  createAccessibleQuizItem,
  deleteAccessibleQuizChat,
  deleteAccessibleQuizItem,
  listAccessibleQuizItems,
  updateAccessibleQuizItem,
} from '../services/quizRepository';

export type ThreadMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  quizItemId?: number;
  questionNo?: number;
  questionText?: string;
  answerText?: string;
};

type QuizThreadContextValue = {
  chatTitle: string;
  messages: ThreadMessage[];
  selectedChatId: number | null;
  isLoadingThread: boolean;
  threadErrorKey: string | null;
  setChatTitle: (title: string) => void;
  deleteCurrentChat: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  selectChat: (chat: QuizChat) => Promise<void>;
  startNewChat: () => void;
  deleteThreadQuizItem: (itemId: number) => Promise<void>;
  updateThreadQuizItem: (itemId: number, questionText: string, answerText: string) => Promise<QuizItem>;
};

const QuizThreadContext = createContext<QuizThreadContextValue | null>(null);
const CHAT_NAME_MAX_LENGTH = 50;

function formatQuizItem(item: QuizItem) {
  return translate('chat.editSaved', {
    n: item.questionNo,
    q: item.questionText,
    a: item.answerText ?? '',
  });
}

function createQuizItemMessage(item: QuizItem): ThreadMessage {
  return {
    id: `quiz-${item.id}`,
    role: 'assistant',
    text: formatQuizItem(item),
    quizItemId: item.id,
    questionNo: item.questionNo,
    questionText: item.questionText,
    answerText: item.answerText ?? '',
  };
}

export function QuizThreadProvider({ children }: { children: ReactNode }) {
  const [chatTitle, setChatTitle] = useState('');
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [threadErrorKey, setThreadErrorKey] = useState<string | null>(null);
  const messageIdRef = useRef(0);

  const nextMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return `local-${messageIdRef.current}`;
  }, []);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      setThreadErrorKey(null);
      let activeChatId = selectedChatId;

      if (activeChatId == null) {
        const chat = await createAccessibleQuizChat(text.slice(0, CHAT_NAME_MAX_LENGTH));
        activeChatId = chat.id;
        setSelectedChatId(chat.id);
        setChatTitle(chat.name);
      }

      const userMessage: ThreadMessage = { id: nextMessageId(), role: 'user', text };

      if (pendingQuestion) {
        const item = await createAccessibleQuizItem(activeChatId, pendingQuestion, text);
        const assistantMessage = createQuizItemMessage(item);
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setPendingQuestion(null);
        return;
      }

      const assistantMessage: ThreadMessage = {
        id: nextMessageId(),
        role: 'assistant',
        text: translate('chat.answerPrompt', { question: text }),
        questionText: text,
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setPendingQuestion(text);
    },
    [nextMessageId, pendingQuestion, selectedChatId]
  );

  const selectChat = useCallback(async (chat: QuizChat) => {
    setSelectedChatId(chat.id);
    setChatTitle(chat.name);
    setPendingQuestion(null);
    setMessages([]);
    setThreadErrorKey(null);
    setIsLoadingThread(true);

    try {
      const items = await listAccessibleQuizItems(chat.id);
      setMessages(items.map(createQuizItemMessage));
    } catch {
      setThreadErrorKey('quiz.loadItemsFailed');
    } finally {
      setIsLoadingThread(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setSelectedChatId(null);
    setChatTitle('');
    setPendingQuestion(null);
    setMessages([]);
    setThreadErrorKey(null);
    setIsLoadingThread(false);
  }, []);

  const updateThreadQuizItem = useCallback(
    async (itemId: number, questionText: string, answerText: string) => {
      if (selectedChatId == null) throw new Error('CHAT_REQUIRED');

      const item = await updateAccessibleQuizItem(selectedChatId, itemId, questionText, answerText);
      const nextMessage = createQuizItemMessage(item);

      setMessages((prev) => prev.map((message) => (message.quizItemId === item.id ? nextMessage : message)));

      return item;
    },
    [selectedChatId]
  );

  const deleteThreadQuizItem = useCallback(
    async (itemId: number) => {
      if (selectedChatId == null) throw new Error('CHAT_REQUIRED');

      await deleteAccessibleQuizItem(selectedChatId, itemId);
      setMessages((prev) => prev.filter((message) => message.quizItemId !== itemId));
    },
    [selectedChatId]
  );

  const deleteCurrentChat = useCallback(async () => {
    if (selectedChatId == null) throw new Error('CHAT_REQUIRED');

    await deleteAccessibleQuizChat(selectedChatId);
    setSelectedChatId(null);
    setChatTitle('');
    setPendingQuestion(null);
    setMessages([]);
    setThreadErrorKey(null);
    setIsLoadingThread(false);
  }, [selectedChatId]);

  const value = useMemo(
    () => ({
      chatTitle,
      messages,
      selectedChatId,
      isLoadingThread,
      threadErrorKey,
      setChatTitle,
      deleteCurrentChat,
      deleteThreadQuizItem,
      sendMessage,
      selectChat,
      startNewChat,
      updateThreadQuizItem,
    }),
    [
      chatTitle,
      deleteCurrentChat,
      deleteThreadQuizItem,
      isLoadingThread,
      messages,
      selectedChatId,
      selectChat,
      sendMessage,
      startNewChat,
      threadErrorKey,
      updateThreadQuizItem,
    ]
  );

  return <QuizThreadContext.Provider value={value}>{children}</QuizThreadContext.Provider>;
}

export function useQuizThread() {
  const value = useContext(QuizThreadContext);

  if (!value) {
    throw new Error('useQuizThread must be used inside QuizThreadProvider');
  }

  return value;
}
