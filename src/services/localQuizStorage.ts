import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizChat, QuizItem } from './quizApi';

const LOCAL_QUIZ_STORE_KEY = 'send_local_quiz_store_v1';

type LocalQuizStore = {
  chats: QuizChat[];
  itemsByChatId: Record<string, QuizItem[]>;
  nextChatId: number;
  nextItemId: number;
};

function createEmptyStore(): LocalQuizStore {
  return {
    chats: [],
    itemsByChatId: {},
    nextChatId: -1,
    nextItemId: -1,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStore(value: unknown): LocalQuizStore {
  if (!isRecord(value)) return createEmptyStore();

  return {
    chats: Array.isArray(value.chats) ? (value.chats as QuizChat[]) : [],
    itemsByChatId: isRecord(value.itemsByChatId) ? (value.itemsByChatId as Record<string, QuizItem[]>) : {},
    nextChatId: typeof value.nextChatId === 'number' && value.nextChatId < 0 ? value.nextChatId : -1,
    nextItemId: typeof value.nextItemId === 'number' && value.nextItemId < 0 ? value.nextItemId : -1,
  };
}

async function readStore(): Promise<LocalQuizStore> {
  const raw = await AsyncStorage.getItem(LOCAL_QUIZ_STORE_KEY);
  if (!raw) return createEmptyStore();

  try {
    return normalizeStore(JSON.parse(raw));
  } catch {
    return createEmptyStore();
  }
}

async function writeStore(store: LocalQuizStore) {
  await AsyncStorage.setItem(LOCAL_QUIZ_STORE_KEY, JSON.stringify(store));
}

function sortChats(chats: QuizChat[]) {
  return [...chats].sort((a, b) => {
    const updatedAtDiff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return updatedAtDiff || b.id - a.id;
  });
}

function touchChat(store: LocalQuizStore, chatId: number, now: string) {
  store.chats = store.chats.map((chat) => (chat.id === chatId ? { ...chat, updatedAt: now } : chat));
}

function requireChat(store: LocalQuizStore, chatId: number) {
  const chat = store.chats.find((item) => item.id === chatId);
  if (!chat) throw new Error('LOCAL_CHAT_NOT_FOUND');
  return chat;
}

function requireItem(items: QuizItem[], itemId: number) {
  const item = items.find((entry) => entry.id === itemId);
  if (!item) throw new Error('LOCAL_ITEM_NOT_FOUND');
  return item;
}

export function isLocalQuizId(id: number | null | undefined) {
  return typeof id === 'number' && id < 0;
}

export async function listLocalQuizChats(): Promise<QuizChat[]> {
  const store = await readStore();
  return sortChats(store.chats);
}

export async function createLocalQuizChat(name: string): Promise<QuizChat> {
  const store = await readStore();
  const now = new Date().toISOString();
  const chat: QuizChat = {
    id: store.nextChatId,
    name,
    createdAt: now,
    updatedAt: now,
  };

  store.nextChatId -= 1;
  store.chats = [chat, ...store.chats];
  store.itemsByChatId[String(chat.id)] = [];
  await writeStore(store);

  return chat;
}

export async function renameLocalQuizChat(chatId: number, name: string): Promise<QuizChat> {
  const store = await readStore();
  const now = new Date().toISOString();
  requireChat(store, chatId);

  let updatedChat: QuizChat | null = null;
  store.chats = store.chats.map((chat) => {
    if (chat.id !== chatId) return chat;

    updatedChat = { ...chat, name, updatedAt: now };
    return updatedChat;
  });
  await writeStore(store);

  return updatedChat ?? requireChat(store, chatId);
}

export async function deleteLocalQuizChat(chatId: number): Promise<void> {
  const store = await readStore();
  store.chats = store.chats.filter((chat) => chat.id !== chatId);
  delete store.itemsByChatId[String(chatId)];
  await writeStore(store);
}

export async function listLocalQuizItems(chatId: number): Promise<QuizItem[]> {
  const store = await readStore();
  requireChat(store, chatId);
  return [...(store.itemsByChatId[String(chatId)] ?? [])].sort((a, b) => a.questionNo - b.questionNo);
}

export async function createLocalQuizItem(
  chatId: number,
  questionText: string,
  answerText: string
): Promise<QuizItem> {
  const store = await readStore();
  requireChat(store, chatId);

  const chatItems = store.itemsByChatId[String(chatId)] ?? [];
  const now = new Date().toISOString();
  const item: QuizItem = {
    id: store.nextItemId,
    questionNo: Math.max(0, ...chatItems.map((entry) => entry.questionNo)) + 1,
    questionText,
    answerText,
    createdAt: now,
    updatedAt: now,
  };

  store.nextItemId -= 1;
  store.itemsByChatId[String(chatId)] = [...chatItems, item];
  touchChat(store, chatId, now);
  await writeStore(store);

  return item;
}

export async function updateLocalQuizItem(
  chatId: number,
  itemId: number,
  questionText: string,
  answerText: string
): Promise<QuizItem> {
  const store = await readStore();
  requireChat(store, chatId);

  const now = new Date().toISOString();
  const chatItems = store.itemsByChatId[String(chatId)] ?? [];
  requireItem(chatItems, itemId);

  let updatedItem: QuizItem | null = null;
  store.itemsByChatId[String(chatId)] = chatItems.map((item) => {
    if (item.id !== itemId) return item;

    updatedItem = { ...item, questionText, answerText, updatedAt: now };
    return updatedItem;
  });
  touchChat(store, chatId, now);
  await writeStore(store);

  return updatedItem ?? requireItem(store.itemsByChatId[String(chatId)] ?? [], itemId);
}

export async function deleteLocalQuizItem(chatId: number, itemId: number): Promise<void> {
  const store = await readStore();
  requireChat(store, chatId);

  const now = new Date().toISOString();
  const chatItems = store.itemsByChatId[String(chatId)] ?? [];
  store.itemsByChatId[String(chatId)] = chatItems.filter((item) => item.id !== itemId);
  touchChat(store, chatId, now);
  await writeStore(store);
}
