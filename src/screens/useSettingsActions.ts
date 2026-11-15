import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router/react-navigation';
import { clearAccessToken, getAccessToken } from '../services/authedFetch';

export const LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'pt-BR', name: 'Português (BR)' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'es', name: 'Español' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'de', name: 'Deutsch' },
] as const;

export function useSettingsActions() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const checkSession = async () => {
        try {
          const token = await getAccessToken();
          if (isActive) {
            setIsLoggedIn(Boolean(token));
          }
        } catch {
          if (isActive) {
            setIsLoggedIn(false);
          }
        }
      };

      checkSession();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleProfilePress = useCallback(() => {
    if (isLoggedIn) {
      router.push('/profile-manage');
    } else {
      setShowAuthModal(true);
    }
  }, [isLoggedIn, router]);
  const handleOpenTerms = useCallback(() => router.push({ pathname: '/policy-webview', params: { document: 'terms' } }), [router]);
  const handleOpenPrivacy = useCallback(() => router.push({ pathname: '/policy-webview', params: { document: 'privacy' } }), [router]);
  const handleOpenFeedback = useCallback(() => router.push('/feedback'), [router]);
  const handleLoginPress = useCallback(() => setShowAuthModal(true), []);
  const handleLogout = useCallback(async () => {
    try {
      await clearAccessToken();
    } finally {
      setIsLoggedIn(false);
    }
  }, []);
  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    setIsLoggedIn(true);
    router.replace('/');
  }, [router]);
  return {
    isLoggedIn, showAuthModal, setShowAuthModal, handleProfilePress,
    handleOpenTerms, handleOpenPrivacy, handleOpenFeedback,
    handleLoginPress, handleLogout, handleAuthSuccess,
  };
}
