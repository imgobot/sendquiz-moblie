import { AdMobNativeAd } from '../../../components/ads';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import type { TextInputInstance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useNavigation, useRouter } from 'expo-router';
import type { NativeStackNavigationProp } from 'expo-router/native-stack';
import type { ParamListBase } from 'expo-router/react-navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { msg } from '../../../constants/appMessages';
import { TEXT_INPUT_NO_SUGGESTIONS_PROPS } from '../../../constants/textInput';
import { useQuizThread } from '../../../contexts/QuizThreadContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { renameAccessibleQuizChat } from '../../../services/quizRepository';
import { isAuthRequiredError } from '../../../utils/errors';

const RENAME_CHAT_CTA_BLUE = '#3182F6';
const RENAME_CHAT_CTA_TEXT = '#FFFFFF';

export default function RenameChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const router = useRouter();
  const { t } = useTranslation();
  const { palette } = useTheme();
  const { chatTitle, deleteCurrentChat, selectedChatId, setChatTitle } = useQuizThread();
  const inputRef = useRef<TextInputInstance>(null);
  const isExitingRef = useRef(false);
  const isFocusedRef = useRef(false);
  const [name, setName] = useState(chatTitle || t('quiz.newChatTitle'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(() => Keyboard.metrics()?.height ?? 0);
  const canSubmit = name.trim().length > 0;

  const focusInput = useCallback(() => {
    if (!isFocusedRef.current || isExitingRef.current) return;
    inputRef.current?.focus();
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      isExitingRef.current = false;

      const frame = requestAnimationFrame(focusInput);

      return () => {
        cancelAnimationFrame(frame);
        isFocusedRef.current = false;
        isExitingRef.current = true;
      };
    }, [focusInput])
  );

  useEffect(() => {
    const unsubscribeTransitionStart = navigation.addListener('transitionStart', (event) => {
      if (!event.data.closing) return;

      isExitingRef.current = true;
      Keyboard.dismiss();
    });
    const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', (event) => {
      if (event.data.closing) return;

      isExitingRef.current = false;
      focusInput();
    });
    const unsubscribeGestureCancel = navigation.addListener('gestureCancel', () => {
      isExitingRef.current = false;
      focusInput();
    });

    return () => {
      unsubscribeTransitionStart();
      unsubscribeTransitionEnd();
      unsubscribeGestureCancel();
    };
  }, [focusInput, navigation]);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    return () => subscription.remove();
  }, []);

  const handleClear = useCallback(() => {
    setName('');
    focusInput();
  }, [focusInput]);

  const handleSubmit = useCallback(async () => {
    const nextName = name.trim();
    if (!canSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (selectedChatId == null) {
        setChatTitle(nextName);
      } else {
        const updated = await renameAccessibleQuizChat(selectedChatId, nextName);
        setChatTitle(updated.name);
      }

      router.back();
    } catch (error) {
      Alert.alert('', isAuthRequiredError(error) ? msg(t, 'QUIZ_LOGIN_REQUIRED') : msg(t, 'QUIZ_RENAME_CHAT_FAILED'));
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, isSubmitting, name, router, selectedChatId, setChatTitle, t]);

  const handleDelete = useCallback(() => {
    if (selectedChatId == null || isSubmitting) return;

    Alert.alert(msg(t, 'QUIZ_DELETE_CHAT_CONFIRM_TITLE'), msg(t, 'QUIZ_DELETE_CHAT_CONFIRM_BODY'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              setIsSubmitting(true);
              await deleteCurrentChat();
              router.dismissTo('/');
            } catch (error) {
              Alert.alert(
                '',
                isAuthRequiredError(error) ? msg(t, 'QUIZ_LOGIN_REQUIRED') : msg(t, 'QUIZ_DELETE_CHAT_FAILED')
              );
            } finally {
              setIsSubmitting(false);
            }
          })();
        },
      },
    ]);
  }, [deleteCurrentChat, isSubmitting, router, selectedChatId, t]);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ title: '' }} />
      <Stack.Toolbar placement="right">
        {selectedChatId != null && (
          <Stack.Toolbar.Button icon={process.env.EXPO_OS === 'ios' ? 'trash' : DeleteIcon}
            accessibilityLabel={t('common.delete')} disabled={isSubmitting}
            tintColor={palette.error} onPress={handleDelete} />
        )}
      </Stack.Toolbar>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <AdMobNativeAd />
        <Text style={[styles.title, { color: palette.text }]}>{t('quiz.renameChatInputTitle')}</Text>
        <View style={styles.field}>
          <Text style={[styles.label, { color: RENAME_CHAT_CTA_BLUE }]}>{t('quiz.chatNameLabel')}</Text>
          <View style={[styles.inputRow, { borderBottomColor: RENAME_CHAT_CTA_BLUE }]}>
            <TextInput
              ref={inputRef}
              autoFocus
              {...TEXT_INPUT_NO_SUGGESTIONS_PROPS}
              maxLength={50}
              onChangeText={setName}
              onBlur={focusInput}
              onSubmitEditing={handleSubmit}
              placeholder={t('quiz.chatNamePlaceholder')}
              placeholderTextColor={palette.placeholder}
              returnKeyType="done"
              submitBehavior="submit"
              selectionColor={RENAME_CHAT_CTA_BLUE}
              cursorColor={RENAME_CHAT_CTA_BLUE}
              style={[styles.input, { color: palette.text }]}
              value={name}
            />
            {name.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.delete')}
                hitSlop={8}
                onPress={handleClear}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={26} color={palette.iconMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.submitButtonContainer, { bottom: keyboardHeight }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit || isSubmitting }}
          disabled={!canSubmit || isSubmitting}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            { backgroundColor: RENAME_CHAT_CTA_BLUE },
          ]}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: canSubmit && !isSubmitting ? RENAME_CHAT_CTA_TEXT : palette.iconMuted },
            ]}
          >
            {t('quiz.renameChatSubmit')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 27,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: 0,
  },
  field: {
    marginTop: 44,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  inputRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 3,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  submitButton: {
    width: '100%',
    minHeight: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
  },
});
