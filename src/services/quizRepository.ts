import { getAccessToken } from './authedFetch';
import {
  createQuizChat,
  createQuizItem,
  deleteQuizChat,
  deleteQuizItem,
  listQuizChats,
  listQuizItems,
  renameQuizChat,
  updateQuizItem,
  type QuizChat,
  type QuizItem,
} from './quizApi';
import {
  createLocalQuizChat,
  createLocalQuizItem,
  deleteLocalQuizChat,
  deleteLocalQuizItem,
  isLocalQuizId,
  listLocalQuizChats,
  listLocalQuizItems,
  renameLocalQuizChat,
  updateLocalQuizItem,
} from './localQuizStorage';

async function shouldUseLocal(chatId?: number | null) {
  if (isLocalQuizId(chatId)) return true;
  return !(await getAccessToken());
}

export async function listAccessibleQuizChats(): Promise<QuizChat[]> {
  if (await shouldUseLocal()) return listLocalQuizChats();
  return listQuizChats();
}

export async function createAccessibleQuizChat(name: string): Promise<QuizChat> {
  if (await shouldUseLocal()) return createLocalQuizChat(name);
  return createQuizChat(name);
}

export async function renameAccessibleQuizChat(chatId: number, name: string): Promise<QuizChat> {
  if (await shouldUseLocal(chatId)) return renameLocalQuizChat(chatId, name);
  return renameQuizChat(chatId, name);
}

export async function deleteAccessibleQuizChat(chatId: number): Promise<void> {
  if (await shouldUseLocal(chatId)) return deleteLocalQuizChat(chatId);
  return deleteQuizChat(chatId);
}

export async function listAccessibleQuizItems(chatId: number): Promise<QuizItem[]> {
  if (await shouldUseLocal(chatId)) return listLocalQuizItems(chatId);
  return listQuizItems(chatId);
}

export async function createAccessibleQuizItem(
  chatId: number,
  questionText: string,
  answerText: string
): Promise<QuizItem> {
  if (await shouldUseLocal(chatId)) return createLocalQuizItem(chatId, questionText, answerText);
  return createQuizItem(chatId, questionText, answerText);
}

export async function updateAccessibleQuizItem(
  chatId: number,
  itemId: number,
  questionText: string,
  answerText: string
): Promise<QuizItem> {
  if (await shouldUseLocal(chatId)) return updateLocalQuizItem(chatId, itemId, questionText, answerText);
  return updateQuizItem(chatId, itemId, questionText, answerText);
}

export async function deleteAccessibleQuizItem(chatId: number, itemId: number): Promise<void> {
  if (await shouldUseLocal(chatId)) return deleteLocalQuizItem(chatId, itemId);
  return deleteQuizItem(chatId, itemId);
}
