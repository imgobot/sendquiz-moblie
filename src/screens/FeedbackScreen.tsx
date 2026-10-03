import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { submitFeedback } from '../services/feedbackApi';
import { useTheme } from '../contexts/ThemeContext';
import { msg } from '../constants/appMessages';

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
    <SafeAreaView style={[styles.container, { backgroundColor: palette.card }]} edges={[]}>
      <Stack.Screen
        options={{
          title: t('feedback.title'),
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={[styles.submitText, { color: palette.primary }, isSubmitting && { color: palette.muted }]}>{t('common.send')}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.content}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  submitText: { fontSize: 16, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  input: { flex: 1, fontSize: 16, lineHeight: 24 },
});
