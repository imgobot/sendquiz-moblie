import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'send_auth_token';

export async function getAccessToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function setAccessToken(token: string) {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function clearAccessToken() {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function authedFetch(url: string, init: RequestInit = {}) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    const error = new Error('AUTH_REQUIRED');
    (error as any).status = 401;
    throw error;
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');

  return fetch(url, { ...init, headers });
}
