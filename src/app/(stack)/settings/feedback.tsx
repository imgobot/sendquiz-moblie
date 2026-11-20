import { AdMobNativeAd } from '../../../components/ads';
import { useCallback, useState } from 'react';
import { ScrollView, Alert, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { submitFeedback } from '../../../services/feedbackApi';
import { useTheme } from '../../../contexts/ThemeContext';
import { msg } from '../../../constants/appMessages';

export default function FeedbackScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) {
      Alert.alert('', msg(t, 'FEEDBACK_MESSAGE_REQUIRED'));
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFeedback(message.trim());
      Alert.alert('', msg(t, 'FEEDBACK_SUBMIT_SUCCESS'));
      router.back();
    } catch {
      Alert.alert('', msg(t, 'FEEDBACK_SUBMIT_FAILED'));
    } finally {
      setIsSubmitting(false);
    }
  }, [message, router, t]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.card }]} edges={['bottom']}>
      <Stack.Screen options={{ title: t('feedback.title') }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={handleSubmit} disabled={isSubmitting}
          tintColor={palette.primary}>
          {t('common.send')}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <AdMobNativeAd />
        <TextInput
          style={[styles.input, { color: palette.text }]}
          value={message}
          onChangeText={setMessage}
          placeholder={t('feedback.placeholder')}
          placeholderTextColor={palette.placeholder}
          selectionColor={palette.primary}
          cursorColor={palette.primary}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingVertical: 20 },
  input: { flex: 1, fontSize: 16, lineHeight: 24 },
});
