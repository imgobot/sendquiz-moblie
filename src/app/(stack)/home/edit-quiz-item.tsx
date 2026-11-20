import { AdMobNativeAd } from '../../../components/ads';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import type { TextInputInstance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
import { isAuthRequiredError } from '../../../utils/errors';

const EDIT_QUIZ_CTA_BLUE = '#3182F6';
const EDIT_QUIZ_CTA_TEXT = '#FFFFFF';

type EditQuizField = 'question' | 'answer';

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default function EditQuizItemScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const { palette } = useTheme();
  const { deleteThreadQuizItem, updateThreadQuizItem } = useQuizThread();
  const questionInputRef = useRef<TextInputInstance>(null);
  const answerInputRef = useRef<TextInputInstance>(null);
  const focusedFieldRef = useRef<EditQuizField | null>(null);
  const isExitingRef = useRef(false);
  const isFocusedRef = useRef(false);
  const itemId = Number(firstParam(params.itemId));
  const [questionText, setQuestionText] = useState(firstParam(params.questionText));
  const [answerText, setAnswerText] = useState(firstParam(params.answerText));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(() => Keyboard.metrics()?.height ?? 0);
  const isValidItemId = Number.isFinite(itemId) && itemId !== 0;
  const canSubmit = isValidItemId && questionText.trim().length > 0 && answerText.trim().length > 0;

  const focusInput = useCallback(() => {
    if (!isFocusedRef.current || isExitingRef.current) return;
    questionInputRef.current?.focus();
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

  const focusField = useCallback((field: EditQuizField) => {
    if (field === 'question') {
      questionInputRef.current?.focus();
      return;
    }

    answerInputRef.current?.focus();
  }, []);

  const markFocusedField = useCallback((field: EditQuizField) => {
    focusedFieldRef.current = field;
  }, []);

  const handleSubmit = useCallback(async () => {
    const nextQuestionText = questionText.trim();
    const nextAnswerText = answerText.trim();
    if (isSubmitting) return;
    if (!nextQuestionText) {
      focusField('question');
      return;
    }
    if (focusedFieldRef.current === 'question') {
      focusField('answer');
      return;
    }
    if (!nextAnswerText) {
      focusField('answer');
      return;
    }
    if (!isValidItemId) return;

    try {
      setIsSubmitting(true);
      await updateThreadQuizItem(itemId, nextQuestionText, nextAnswerText);
      router.back();
    } catch (error) {
      Alert.alert('', isAuthRequiredError(error) ? msg(t, 'QUIZ_LOGIN_REQUIRED') : msg(t, 'QUIZ_UPDATE_ITEM_FAILED'));
    } finally {
      setIsSubmitting(false);
    }
  }, [answerText, focusField, isSubmitting, isValidItemId, itemId, questionText, router, t, updateThreadQuizItem]);

  const handleDelete = useCallback(() => {
    if (!isValidItemId || isSubmitting) return;

    Alert.alert(msg(t, 'QUIZ_DELETE_ITEM_CONFIRM_TITLE'), msg(t, 'QUIZ_DELETE_ITEM_CONFIRM_BODY'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              setIsSubmitting(true);
              await deleteThreadQuizItem(itemId);
              router.back();
            } catch (error) {
              Alert.alert(
                '',
                isAuthRequiredError(error) ? msg(t, 'QUIZ_LOGIN_REQUIRED') : msg(t, 'QUIZ_DELETE_ITEM_FAILED')
              );
            } finally {
              setIsSubmitting(false);
            }
          })();
        },
      },
    ]);
  }, [deleteThreadQuizItem, isSubmitting, isValidItemId, itemId, router, t]);

  const renderClearButton = useCallback(
    (onPress: () => void) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.delete')}
        hitSlop={8}
        onPress={onPress}
        style={styles.clearButton}
      >
        <Ionicons name="close-circle" size={26} color={palette.iconMuted} />
      </Pressable>
    ),
    [palette.iconMuted, t]
  );

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ title: '' }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon={process.env.EXPO_OS === 'ios' ? 'trash' : DeleteIcon}
            accessibilityLabel={t('common.delete')} disabled={isSubmitting}
            tintColor={palette.error} onPress={handleDelete} />
      </Stack.Toolbar>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <AdMobNativeAd />
        <Text style={[styles.title, { color: palette.text }]}>{t('quiz.editItemTitle')}</Text>
        <View style={styles.field}>
          <Text style={[styles.label, { color: EDIT_QUIZ_CTA_BLUE }]}>{t('quiz.editItemQuestionLabel')}</Text>
          <View style={[styles.inputRow, { borderBottomColor: EDIT_QUIZ_CTA_BLUE }]}>
            <TextInput
              ref={questionInputRef}
              autoFocus
              multiline
              {...TEXT_INPUT_NO_SUGGESTIONS_PROPS}
              maxLength={1000}
              onChangeText={setQuestionText}
              onFocus={() => markFocusedField('question')}
              placeholder={t('quiz.editItemQuestionPlaceholder')}
              placeholderTextColor={palette.placeholder}
              returnKeyType="next"
              onSubmitEditing={() => focusField('answer')}
              selectionColor={EDIT_QUIZ_CTA_BLUE}
              cursorColor={EDIT_QUIZ_CTA_BLUE}
              style={[styles.input, { color: palette.text }]}
              value={questionText}
            />
            {questionText.length > 0 ? renderClearButton(() => setQuestionText('')) : null}
          </View>
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: EDIT_QUIZ_CTA_BLUE }]}>{t('quiz.editItemAnswerLabel')}</Text>
          <View style={[styles.inputRow, { borderBottomColor: EDIT_QUIZ_CTA_BLUE }]}>
            <TextInput
              ref={answerInputRef}
              multiline
              {...TEXT_INPUT_NO_SUGGESTIONS_PROPS}
              maxLength={1000}
              onChangeText={setAnswerText}
              onFocus={() => markFocusedField('answer')}
              placeholder={t('quiz.editItemAnswerPlaceholder')}
              placeholderTextColor={palette.placeholder}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              selectionColor={EDIT_QUIZ_CTA_BLUE}
              cursorColor={EDIT_QUIZ_CTA_BLUE}
              style={[styles.input, { color: palette.text }]}
              value={answerText}
            />
            {answerText.length > 0 ? renderClearButton(() => setAnswerText('')) : null}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.submitButtonContainer, { bottom: keyboardHeight }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit || isSubmitting }}
          disabled={!canSubmit || isSubmitting}
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: EDIT_QUIZ_CTA_BLUE }]}
        >
          <Text
            style={[
              styles.submitButtonText,
              { color: canSubmit && !isSubmitting ? EDIT_QUIZ_CTA_TEXT : palette.iconMuted },
            ]}
          >
            {t('common.save')}
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
    marginTop: 36,
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
    maxHeight: 128,
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
