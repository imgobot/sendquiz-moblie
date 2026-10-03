import Constants from 'expo-constants';

const rawApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;

export const API_BASE_URL =
  typeof rawApiBaseUrl === 'string' && rawApiBaseUrl.trim()
    ? rawApiBaseUrl.trim().replace(/\/+$/, '')
    : 'https://sendquiz.net';
