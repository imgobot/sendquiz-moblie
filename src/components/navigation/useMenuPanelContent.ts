import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { msg } from '../../constants/appMessages';
import { useQuizThread } from '../../contexts/QuizThreadContext';
import type { QuizChat } from '../../services/quizApi';
import { listAccessibleQuizChats } from '../../services/quizRepository';
import { isAuthRequiredError } from '../../utils/errors';

export type AppMenuPanelContentProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function useMenuPanelContent({ isOpen, onClose }: AppMenuPanelContentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectChat, startNewChat } = useQuizThread();
  const [chats, setChats] = useState<QuizChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageText, setMessageText] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      setMessageText(null);
      setChats(await listAccessibleQuizChats());
    } catch (error) {
      setChats([]);
      setMessageText(isAuthRequiredError(error) ? msg(t, 'QUIZ_LOGIN_REQUIRED') : msg(t, 'QUIZ_LOAD_CHATS_FAILED'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen, loadChats]);

  const openChat = useCallback(
    (chat: QuizChat) => {
      onClose();
      void selectChat(chat);
    },
    [onClose, selectChat]
  );

  const handleNewQuiz = useCallback(() => {
    startNewChat();
    onClose();
  }, [onClose, startNewChat]);

  const handleOpenSettings = useCallback(() => {
    onClose();
    router.push('/settings');
  }, [onClose, router]);

  return { chats, isLoading, messageText, openChat, handleNewQuiz, handleOpenSettings };
}
