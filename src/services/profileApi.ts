import { API_BASE_URL } from '../constants/api';
import { devErrorLog, readResponseBodySafe } from './apiUtils';
import { authedFetch } from './authedFetch';

type ApiOk<T> = { code: string; message: string } & T;

export type MyProfile = {
  id: number;
  email: string | null;
  hasPasswordLogin: boolean;
  nickname: string | null;
};

function mapUser(row: any): MyProfile {
  return {
    id: Number(row.ID),
    email: row.EMAIL == null ? null : String(row.EMAIL),
    hasPasswordLogin: Boolean(row.HAS_PASSWORD_LOGIN),
    nickname: row.NICKNAME == null ? null : String(row.NICKNAME),
  };
}

export async function getMyProfile(): Promise<MyProfile> {
  const url = `${API_BASE_URL}/profile/me`;

  try {
    const response = await authedFetch(url, { method: 'GET' });
    if (!response.ok) {
      const body = await readResponseBodySafe(response);
      devErrorLog('GET_MY_PROFILE_FAILED', { url, status: response.status, body });
      throw new Error(`GET_MY_PROFILE_FAILED:${response.status}`);
    }

    const data = (await response.json()) as ApiOk<{ user: any }>;
    return mapUser(data.user);
  } catch (error) {
    devErrorLog('GET_MY_PROFILE_REQUEST_ERROR', { url, error: String(error) });
    throw error;
  }
}

export async function updateMyNickname(nickname: string): Promise<MyProfile> {
  const url = `${API_BASE_URL}/profile/nickname`;

  try {
    const response = await authedFetch(url, { method: 'PATCH', body: JSON.stringify({ nickname }) });
    if (!response.ok) {
      const body = await readResponseBodySafe(response);
      devErrorLog('UPDATE_MY_NICKNAME_FAILED', { url, status: response.status, body });
      throw new Error(`UPDATE_MY_NICKNAME_FAILED:${response.status}`);
    }

    const data = (await response.json()) as ApiOk<{ user: any }>;
    return mapUser(data.user);
  } catch (error) {
    devErrorLog('UPDATE_MY_NICKNAME_REQUEST_ERROR', { url, error: String(error) });
    throw error;
  }
}

export async function withdrawMyAccount() {
  const url = `${API_BASE_URL}/profile/withdraw`;

  try {
    const response = await authedFetch(url, { method: 'POST' });
    if (!response.ok) {
      const body = await readResponseBodySafe(response);
      devErrorLog('WITHDRAW_MY_ACCOUNT_FAILED', { url, status: response.status, body });
      throw new Error(`WITHDRAW_MY_ACCOUNT_FAILED:${response.status}`);
    }
  } catch (error) {
    devErrorLog('WITHDRAW_MY_ACCOUNT_REQUEST_ERROR', { url, error: String(error) });
    throw error;
  }
}
