import { API_BASE_URL } from '../constants/api';
import { isAuthRequiredError } from '../utils/errors';
import { devErrorLog, readResponseBodySafe } from './apiUtils';
import { authedFetch } from './authedFetch';

type ApiOk<T> = { code: string; message: string } & T;

export type QuizChat = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type QuizItem = {
  id: number;
  questionNo: number;
  questionText: string;
  answerText?: string;
  createdAt: string;
  updatedAt: string;
};

function mapChat(row: any): QuizChat {
  return {
    id: Number(row.ID),
    name: String(row.NAME),
    createdAt: String(row.CREATED_AT),
    updatedAt: String(row.UPDATED_AT),
  };
}

function mapItem(row: any): QuizItem {
  return {
    id: Number(row.ID),
    questionNo: Number(row.QUESTION_NO),
    questionText: String(row.QUESTION_TEXT),
    answerText: row.ANSWER_TEXT == null ? undefined : String(row.ANSWER_TEXT),
    createdAt: String(row.CREATED_AT),
    updatedAt: String(row.UPDATED_AT),
  };
}

function throwAuthRequired() {
  const error = new Error('AUTH_REQUIRED');
  (error as any).status = 401;
  throw error;
}

export async function listQuizChats(): Promise<QuizChat[]> {
  const url = `${API_BASE_URL}/quiz/chats`;

  try {
    const response = await authedFetch(url, { method: 'GET' });
    if (!response.ok) {
      if (response.status === 401) throwAuthRequired();

      const body = await readResponseBodySafe(response);
      devErrorLog('LIST_QUIZ_CHATS_FAILED', { url, status: response.status, body });
      throw new Error(`LIST_QUIZ_CHATS_FAILED:${response.status}`);
    }

    const data = (await response.json()) as ApiOk<{ chats: any[] }>;
    return Array.isArray(data.chats) ? data.chats.map(mapChat) : [];
  } catch (error) {
    if (!isAuthRequiredError(error)) {
      devErrorLog('LIST_QUIZ_CHATS_REQUEST_ERROR', { url, error: String(error) });
    }
    throw error;
  }
}

export async function createQuizChat(name: string): Promise<QuizChat> {
  const url = `${API_BASE_URL}/quiz/chats`;

  try {
    const response = await authedFetch(url, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      if (response.status === 401) throwAuthRequired();

      const body = await readResponseBodySafe(response);
      devErrorLog('CREATE_QUIZ_CHAT_FAILED', { url, status: response.status, body });
      throw new Error(`CREATE_QUIZ_CHAT_FAILED:${response.status}`);
    }

    const data = (await response.json()) as ApiOk<{ chat: any }>;
    return mapChat(data.chat);
  } catch (error) {
    if (!isAuthRequiredError(error)) {
      devErrorLog('CREATE_QUIZ_CHAT_REQUEST_ERROR', { url, error: String(error) });
    }
    throw error;
  }
}

export async function renameQuizChat(chatId: number, name: string): Promise<QuizChat> {
  const url = `${API_BASE_URL}/quiz/chats/${chatId}`;

  try {
    const response = await authedFetch(url, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      if (response.status === 401) throwAuthRequired();

      const body = await readResponseBodySafe(response);
      devErrorLog('RENAME_QUIZ_CHAT_FAILED', { url, status: response.status, body });
      throw new Error(`RENAME_QUIZ_CHAT_FAILED:${response.status}`);
    }

    const data = (await response.json()) as ApiOk<{ chat: any }>;
    return mapChat(data.chat);
  } catch (error) {
    if (!isAuthRequiredError(error)) {
      devErrorLog('RENAME_QUIZ_CHAT_REQUEST_ERROR', { url, error: String(error) });
    }
    throw error;
  }
}

export async function deleteQuizChat(chatId: number): Promise<void> {
  const url = `${API_BASE_URL}/quiz/chats/${chatId}`;

  try {
    const response = await authedFetch(url, { method: 'DELETE' });
    if (!response.ok) {
      if (response.status === 401) throwAuthRequired();

      const body = await readResponseBodySafe(response);
      devErrorLog('DELETE_QUIZ_CHAT_FAILED', { url, status: response.status, body });
      throw new Error(`DELETE_QUIZ_CHAT_FAILED:${response.status}`);
    }
  } catch (error) {
    if (!isAuthRequiredError(error)) {
      devErrorLog('DELETE_QUIZ_CHAT_REQUEST_ERROR', { url, error: String(error) });
    }
    throw error;
  }
}

export async function createQuizItem(
  chatId: number,
  questionText: string,
  answerText: string
): Promise<QuizItem> {
  const url = `${API_BASE_URL}/quiz/chats/${chatId}/items`;

  try {
    const response = await authedFetch(url, {
      method: 'POST',
      body: JSON.stringify({ questionText, answerText }),
    });
    if (!response.ok) {
      if (response.status === 401) throwAuthRequired();

      const body = await readResponseBodySafe(response);
      devErrorLog('CREATE_QUIZ_ITEM_FAILED', { url, status: response.status, body });
      throw new Error(`CREATE_QUIZ_ITEM_FAILED:${response.status}`);
    }

    const data = (await response.json()) as ApiOk<{ item: any }>;
    return mapItem(data.item);
  } catch (error) {
    if (!isAuthRequiredError(error)) {
      devErrorLog('CREATE_QUIZ_ITEM_REQUEST_ERROR', { url, error: String(error) });
    }
    throw error;
  }
}

export async function updateQuizItem(
  chatId: number,
  itemId: number,
  questionText: string,
  answerText: string
): Promise<QuizItem> {
  const url = `${API_BASE_URL}/quiz/chats/${chatId}/items/${itemId}`;

  try {
    const response = await authedFetch(url, {
      method: 'PATCH',
      body: JSON.stringify({ questionText, answerText }),
    });
    if (!response.ok) {
      if (response.status === 401) throwAuthRequired();

      const body = await readResponseBodySafe(response);
      devErrorLog('UPDATE_QUIZ_ITEM_FAILED', { url, status: response.status, body });
      throw new Error(`UPDATE_QUIZ_ITEM_FAILED:${response.status}`);
    }

    const data = (await response.json()) as ApiOk<{ item: any }>;
    return mapItem(data.item);
  } catch (error) {
    if (!isAuthRequiredError(error)) {
      devErrorLog('UPDATE_QUIZ_ITEM_REQUEST_ERROR', { url, error: String(error) });
    }
    throw error;
  }
}

export async function deleteQuizItem(chatId: number, itemId: number): Promise<void> {
  const url = `${API_BASE_URL}/quiz/chats/${chatId}/items/${itemId}`;

  try {
    const response = await authedFetch(url, { method: 'DELETE' });
    if (!response.ok) {
      if (response.status === 401) throwAuthRequired();

      const body = await readResponseBodySafe(response);
      devErrorLog('DELETE_QUIZ_ITEM_FAILED', { url, status: response.status, body });
      throw new Error(`DELETE_QUIZ_ITEM_FAILED:${response.status}`);
    }
  } catch (error) {
    if (!isAuthRequiredError(error)) {
      devErrorLog('DELETE_QUIZ_ITEM_REQUEST_ERROR', { url, error: String(error) });
    }
    throw error;
  }
}

export async function listQuizItems(chatId: number): Promise<QuizItem[]> {
  const url = `${API_BASE_URL}/quiz/chats/${chatId}/items`;

  try {
    const response = await authedFetch(url, { method: 'GET' });
    if (!response.ok) {
      if (response.status === 401) throwAuthRequired();

      const body = await readResponseBodySafe(response);
      devErrorLog('LIST_QUIZ_ITEMS_FAILED', { url, status: response.status, body });
      throw new Error(`LIST_QUIZ_ITEMS_FAILED:${response.status}`);
    }

    const data = (await response.json()) as ApiOk<{ items: any[] }>;
    return Array.isArray(data.items) ? data.items.map(mapItem) : [];
  } catch (error) {
    if (!isAuthRequiredError(error)) {
      devErrorLog('LIST_QUIZ_ITEMS_REQUEST_ERROR', { url, error: String(error) });
    }
    throw error;
  }
}
