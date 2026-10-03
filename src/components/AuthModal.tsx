import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { API_BASE_URL } from '../constants/api';
import { getAccessToken, setAccessToken } from '../services/authedFetch';
import { useTheme } from '../contexts/ThemeContext';

const AUTH_SESSION_MESSAGE_TYPE = 'send.authSession';
const MOBILE_OAUTH_RETURN_URL = 'send://auth/oauth';
const OAUTH_START_PATH_PATTERN = /^\/api\/auth\/oauth\/web\/(google|apple)\/start$/;

WebBrowser.maybeCompleteAuthSession();

type AuthMode = 'change-password' | 'login';

type AuthModalProps = {
  initialMode?: AuthMode;
  visible: boolean;
  onClose: () => void;
  onAuth: () => void;
};

type AuthModalContentProps = {
  initialMode: AuthMode;
  onClose: () => void;
  onAuth: () => void;
  visible: boolean;
};

function buildAuthUrl(mode: AuthMode) {
  const url = new URL('/auth', API_BASE_URL);
  url.searchParams.set('webview', 'mobile');
  url.searchParams.set('mode', mode);
  return url.toString();
}

function parseAuthMessage(data: string) {
  try {
    const parsed = JSON.parse(data);
    if (parsed?.type !== AUTH_SESSION_MESSAGE_TYPE) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isOAuthStartUrl(url: string) {
  try {
    return OAUTH_START_PATH_PATTERN.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

function withMobileOAuthReturnUrl(url: string) {
  const oauthUrl = new URL(url);
  oauthUrl.searchParams.set('mobile_return_uri', MOBILE_OAUTH_RETURN_URL);
  return oauthUrl.toString();
}

function readMobileOAuthCode(url: string) {
  try {
    return new URL(url).searchParams.get('code') || '';
  } catch {
    return '';
  }
}

async function exchangeMobileOAuthCode(code: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/oauth/mobile/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const payload = await response.json();
  if (!response.ok || typeof payload?.token !== 'string') throw new Error(payload?.message || 'OAUTH_FAILED');
  return payload.token as string;
}

function AuthModalContent({ initialMode, visible, onClose, onAuth }: AuthModalContentProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [initialToken, setInitialToken] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [isOpeningOAuth, setIsOpeningOAuth] = useState(false);
  const source = useMemo(() => ({ uri: buildAuthUrl(initialMode) }), [initialMode]);
  const injectedJavaScriptBeforeContentLoaded = useMemo(() => {
    if (!initialToken) return 'true;';
    return `
      try {
        window.localStorage.setItem(${JSON.stringify(AUTH_SESSION_MESSAGE_TYPE)}, JSON.stringify({
          token: ${JSON.stringify(initialToken)}
        }));
      } catch (error) {}
      true;
    `;
  }, [initialToken]);

  useEffect(() => {
    if (!visible) return;
    let isActive = true;
    setIsPreparing(true);
    getAccessToken()
      .then((token) => {
        if (isActive) setInitialToken(token || '');
      })
      .catch(() => {
        if (isActive) setInitialToken('');
      })
      .finally(() => {
        if (isActive) setIsPreparing(false);
      });
    return () => {
      isActive = false;
    };
  }, [visible]);

  const handleMessage = async (event: WebViewMessageEvent) => {
    const message = parseAuthMessage(event.nativeEvent.data);
    if (!message) return;

    if (message.action === 'passwordChanged') {
      onAuth();
      return;
    }

    const token = message.session?.token;
    if (typeof token !== 'string' || !token) return;

    await setAccessToken(token);
    onAuth();
  };

  const handleShouldStartLoad = (request: { url: string }) => {
    if (!isOAuthStartUrl(request.url)) return true;

    setIsOpeningOAuth(true);
    WebBrowser.openAuthSessionAsync(withMobileOAuthReturnUrl(request.url), MOBILE_OAUTH_RETURN_URL)
      .then(async (result) => {
        if (result.type !== 'success') return;

        const code = readMobileOAuthCode(result.url);
        if (!code) return;

        const token = await exchangeMobileOAuthCode(code);
        await setAccessToken(token);
        onAuth();
      })
      .catch(() => undefined)
      .finally(() => setIsOpeningOAuth(false));

    return false;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          hitSlop={8}
          onPress={onClose}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
      <View style={[styles.webViewFrame, { paddingBottom: insets.bottom }]}>
        {!isPreparing && (
          <WebView
            source={source}
            style={styles.webView}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            setSupportMultipleWindows={false}
            injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator color={palette.primary} />
              </View>
            )}
          />
        )}
        {isPreparing || isOpeningOAuth ? (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.primary} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function AuthModal({ initialMode = 'login', visible, onClose, onAuth }: AuthModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaProvider>
        <AuthModalContent initialMode={initialMode} visible={visible} onClose={onClose} onAuth={onAuth} />
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    alignItems: 'flex-end',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
  },
  closeButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  webViewFrame: { flex: 1, backgroundColor: '#000000' },
  webView: { flex: 1, backgroundColor: '#000000' },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
});
