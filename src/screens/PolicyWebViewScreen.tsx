import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../constants/api';
import { useTheme } from '../contexts/ThemeContext';

type PolicyDocument = 'privacy' | 'terms';

const POLICY_PATH_BY_DOCUMENT: Record<PolicyDocument, string> = {
  privacy: '/policy/privacy-policy/',
  terms: '/policy/terms-of-service/',
};

function getPolicyDocument(value: string | string[] | undefined): PolicyDocument {
  const document = Array.isArray(value) ? value[0] : value;
  return document === 'privacy' ? 'privacy' : 'terms';
}

function buildPolicyUrl(document: PolicyDocument) {
  return new URL(POLICY_PATH_BY_DOCUMENT[document], API_BASE_URL).toString();
}

export default function PolicyWebViewScreen() {
  const params = useLocalSearchParams<{ document?: string | string[] }>();
  const document = getPolicyDocument(params.document);
  const source = useMemo(() => ({ uri: buildPolicyUrl(document) }), [document]);
  const { palette } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ title: document === 'privacy' ? t('settings.privacy') : t('settings.terms') }} />
      <WebView
        source={source}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.webView}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        renderLoading={() => (
          <View style={[styles.loading, { backgroundColor: palette.background }]}>
            <ActivityIndicator color={palette.primary} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webView: { flex: 1 },
});
