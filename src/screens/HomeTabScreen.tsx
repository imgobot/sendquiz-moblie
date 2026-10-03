import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as StoreReview from 'expo-store-review';
import { useIsFocused } from "expo-router/react-navigation";
import { Stack, useRouter } from 'expo-router';
import { type ElementRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  Text,
  StyleSheet,
  TextInput,
  TextInputContentSizeChangeEventData,
  View,
} from 'react-native';
import { KeyboardChatScrollView, KeyboardGestureArea, KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeOut, LinearTransition, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AdMobBanner300x250, AdMobBanner320x50 } from '../components/ads';
import HeaderSettingsButton from '../components/navigation/HeaderSettingsButton';
import { msg } from '../constants/appMessages';
import { CHAT_COMPOSER_TEXT_INPUT_PROPS } from '../constants/textInput';
import { useQuizThread, type ThreadMessage } from '../contexts/QuizThreadContext';
import { useTheme } from '../contexts/ThemeContext';
import { isAuthRequiredError } from '../utils/errors';

const COMPOSER_MIN_HEIGHT = 44;
const COMPOSER_LINE_HEIGHT = 20;
const COMPOSER_MAX_INPUT_HEIGHT = COMPOSER_LINE_HEIGHT * 5;
const COMPOSER_TOP_PADDING = 8;
const COMPOSER_KEYBOARD_MARGIN = 8;
const COMPOSER_BASE_HEIGHT = COMPOSER_MIN_HEIGHT + COMPOSER_TOP_PADDING;
const CHAT_INPUT_NATIVE_ID = 'home-chat-input';

function normalizeAnswer(value: string) {
  return value.normalize('NFKC').replace(/[\s\p{P}\p{S}]+/gu, '');
}

function renderMessageText(item: ThreadMessage) {
  const question = item.role === 'assistant' && item.quizItemId == null ? item.questionText : null;
  if (!question) return item.text;

  const questionStart = item.text.indexOf(question);
  if (questionStart < 0) return item.text;

  return (
    <>
      {item.text.slice(0, questionStart)}
      <Text style={styles.messageTextStrong}>{question}</Text>
      {item.text.slice(questionStart + question.length)}
    </>
  );
}

function renderAnswerRevealText(item: ThreadMessage, answerLabel: string) {
  const labelStart = item.text.indexOf(answerLabel);
  if (labelStart < 0) return item.text;

  return (
    <>
      {item.text.slice(0, labelStart)}
      <Text style={styles.messageTextStrong}>{answerLabel}</Text>
      {item.text.slice(labelStart + answerLabel.length)}
    </>
  );
}

export default function HomeTabScreen() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [activeQuizItems, setActiveQuizItems] = useState<ThreadMessage[]>([]);
  const [wrongQuizItems, setWrongQuizItems] = useState<ThreadMessage[]>([]);
  const [quizSessionMessages, setQuizSessionMessages] = useState<ThreadMessage[]>([]);
  const [inputHeight, setInputHeight] = useState(COMPOSER_MIN_HEIGHT);
  const [composerHeight, setComposerHeight] = useState(0);
  const router = useRouter();
  const isFocused = useIsFocused();
  const scrollRef = useRef<ElementRef<typeof KeyboardChatScrollView>>(null);
  const inputRef = useRef<TextInput>(null);
  const quizMessageIdRef = useRef(0);
  const composerExtraPaddingSV = useSharedValue(0);
  const {
    chatTitle,
    messages: threadMessages,
    selectedChatId,
    isLoadingThread,
    threadErrorKey,
    sendMessage,
  } = useQuizThread();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const exampleQuizPrompts = [
    t('home.exampleQuiz.first'),
    t('home.exampleQuiz.second'),
    t('home.exampleQuiz.third'),
  ];

  const { isDark, palette } = useTheme();
  const quizItems = useMemo(
    () => threadMessages.filter((item) => item.quizItemId != null && item.questionText),
    [threadMessages]
  );
  const visibleThreadMessages = isQuizMode ? quizSessionMessages : threadMessages;
  const quizSessionCompleted =
    isQuizMode && activeQuizItems.length > 0 && quizQuestionIndex >= activeQuizItems.length;
  const hasActiveQuizQuestion = !isQuizMode || quizQuestionIndex < activeQuizItems.length;
  const hasWrongQuizItems = wrongQuizItems.length > 0;
  const canSend = message.trim().length > 0 && !isSending && hasActiveQuizQuestion;
  const isThreadOpen =
    selectedChatId != null || isLoadingThread || threadErrorKey != null || threadMessages.length > 0;
  const displayedChatTitle = chatTitle || t('quiz.newChatTitle');
  const keyboardOffset = insets.bottom - COMPOSER_KEYBOARD_MARGIN;
  const messageActionIconColor = isDark ? '#FFFFFF' : '#111111';
  const quizStartButtonBackground = isDark ? '#FFFFFF' : '#111111';
  const quizStartButtonForeground = isDark ? '#111111' : '#FFFFFF';

  useEffect(() => {
    setIsQuizMode(false);
    setQuizQuestionIndex(0);
    setActiveQuizItems([]);
    setWrongQuizItems([]);
    setQuizSessionMessages([]);
  }, [selectedChatId]);

  const nextQuizMessageId = useCallback(() => {
    quizMessageIdRef.current += 1;
    return `quiz-mode-${quizMessageIdRef.current}`;
  }, []);

  const createQuizQuestionMessage = useCallback(
    (item: ThreadMessage): ThreadMessage => ({
      id: nextQuizMessageId(),
      role: 'assistant',
      text: `${item.questionNo ?? ''}. ${item.questionText ?? ''}`.trim(),
      questionNo: item.questionNo,
      questionText: item.questionText,
    }),
    [nextQuizMessageId]
  );

  const focusComposerInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const startQuizSession = useCallback(
    (items: ThreadMessage[]) => {
      const firstQuizItem = items[0];

      setMessage('');
      setActiveQuizItems(items);
      setWrongQuizItems([]);
      setQuizQuestionIndex(0);
      setQuizSessionMessages(
        firstQuizItem?.questionText ? [createQuizQuestionMessage(firstQuizItem)] : []
      );
      focusComposerInput();
    },
    [createQuizQuestionMessage, focusComposerInput]
  );

  const openRenameScreen = useCallback(() => {
    router.push('/rename-chat');
  }, [router]);

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const nextHeight = Math.min(
        COMPOSER_MAX_INPUT_HEIGHT,
        Math.max(COMPOSER_MIN_HEIGHT, Math.ceil(event.nativeEvent.contentSize.height))
      );
      if (nextHeight !== inputHeight) setInputHeight(nextHeight);
    },
    [inputHeight]
  );

  const handleComposerLayout = useCallback(
    (height: number) => {
      if (!isFocused) return;

      const extraPadding = Math.max(height - COMPOSER_BASE_HEIGHT, 0);
      composerExtraPaddingSV.value = withTiming(extraPadding, { duration: 250 });
      if (height !== composerHeight) setComposerHeight(height);
    },
    [composerExtraPaddingSV, composerHeight, isFocused]
  );

  useEffect(() => {
    if (isFocused) return;

    composerExtraPaddingSV.value = withTiming(0, { duration: 120 });
  }, [composerExtraPaddingSV, isFocused]);

  const requestInAppReview = useCallback(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    void StoreReview.hasAction()
      .then((hasAction) => {
        if (hasAction) return StoreReview.requestReview();
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!quizSessionCompleted) return;

    requestInAppReview();
  }, [quizSessionCompleted, requestInAppReview]);

  const handleSend = useCallback(async () => {
    const text = message.trim();
    if (!text || isSending) return;

    setMessage('');

    if (isQuizMode) {
      const currentQuizItem = activeQuizItems[quizQuestionIndex];
      if (!currentQuizItem) return;

      const answerText = currentQuizItem.answerText ?? '';
      const isCorrect = normalizeAnswer(text) === normalizeAnswer(answerText);
      const nextQuestionIndex = quizQuestionIndex + 1;
      const nextQuizItem = activeQuizItems[nextQuestionIndex];
      const nextMessages: ThreadMessage[] = [
        { id: nextQuizMessageId(), role: 'user', text },
        {
          id: nextQuizMessageId(),
          role: 'assistant',
          text: isCorrect ? t('quiz.correctMessage') : t('quiz.answerReveal', { answer: answerText }),
          answerText: isCorrect ? undefined : answerText,
        },
      ];

      if (nextQuizItem?.questionText) {
        nextMessages.push(createQuizQuestionMessage(nextQuizItem));
      } else {
        nextMessages.push({ id: nextQuizMessageId(), role: 'assistant', text: t('quiz.completed') });
      }

      if (!isCorrect) {
        setWrongQuizItems((prev) => [...prev, currentQuizItem]);
      }
      setQuizQuestionIndex(nextQuestionIndex);
      setQuizSessionMessages((prev) => [...prev, ...nextMessages]);
      return;
    }

    setIsSending(true);

    try {
      await sendMessage(text);
    } catch (error) {
      setMessage(text);
      Alert.alert(
        '',
        isAuthRequiredError(error)
          ? msg(t, 'QUIZ_LOGIN_REQUIRED')
          : msg(t, isThreadOpen ? 'QUIZ_CREATE_ITEM_FAILED' : 'QUIZ_CREATE_CHAT_FAILED')
      );
    } finally {
      setIsSending(false);
    }
  }, [
    activeQuizItems,
    createQuizQuestionMessage,
    isQuizMode,
    isSending,
    isThreadOpen,
    message,
    nextQuizMessageId,
    quizQuestionIndex,
    sendMessage,
    t,
  ]);

  const handleScrollContentSizeChange = useCallback(() => {
    if (isThreadOpen) scrollRef.current?.scrollToEnd({ animated: true });
  }, [isThreadOpen]);

  const handleCopyMessage = useCallback((text: string) => {
    void Clipboard.setStringAsync(text);
  }, []);

  const openEditQuizItemScreen = useCallback(
    (itemId: number, questionText: string, answerText: string) => {
      router.push({
        pathname: '/edit-quiz-item',
        params: {
          itemId: String(itemId),
          questionText,
          answerText,
        },
      });
    },
    [router]
  );

  const toggleQuizMode = useCallback(() => {
    setIsQuizMode((prev) => {
      if (prev) {
        setQuizQuestionIndex(0);
        setActiveQuizItems([]);
        setWrongQuizItems([]);
        setQuizSessionMessages([]);
        return false;
      }

      startQuizSession(quizItems);
      return true;
    });
  }, [quizItems, startQuizSession]);

  const restartQuiz = useCallback(() => {
    startQuizSession(quizItems);
  }, [quizItems, startQuizSession]);

  const retryWrongQuizItems = useCallback(() => {
    if (wrongQuizItems.length === 0) return;

    startQuizSession(wrongQuizItems);
  }, [startQuizSession, wrongQuizItems]);

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: palette.background }]}>
      <Stack.Screen
        options={{
          title: isThreadOpen ? displayedChatTitle : '',
          headerRight: () => {
            if (!isThreadOpen) return <HeaderSettingsButton />;
            if (isQuizMode) return null;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('quiz.renameChatTitle')}
                hitSlop={8}
                onPress={openRenameScreen}
                style={styles.headerAction}
              >
                <Ionicons name="pencil-outline" size={23} color={palette.text} />
              </Pressable>
            );
          },
        }}
      />
      <KeyboardGestureArea
        interpolator="ios"
        offset={COMPOSER_MIN_HEIGHT}
        style={styles.container}
        textInputNativeID={CHAT_INPUT_NATIVE_ID}
      >
        {selectedChatId != null ? (
          <View style={[styles.chatHeaderAd, { backgroundColor: palette.background }]}>
            <AdMobBanner320x50 />
          </View>
        ) : null}
        <KeyboardChatScrollView
          automaticallyAdjustContentInsets={false}
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            isThreadOpen && styles.threadScrollContent,
            { paddingBottom: Math.max(composerHeight, 16) + 16 },
          ]}
          contentInsetAdjustmentBehavior="never"
          extraContentPadding={composerExtraPaddingSV}
          freeze={!isFocused}
          keyboardDismissMode="none"
          keyboardLiftBehavior="whenAtEnd"
          keyboardShouldPersistTaps="handled"
          offset={keyboardOffset}
          onContentSizeChange={handleScrollContentSizeChange}
          showsVerticalScrollIndicator
        >
          {isThreadOpen ? (
            <Animated.View
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(120)}
              layout={LinearTransition.duration(180)}
              style={styles.threadContent}
            >
              {isLoadingThread ? (
                <View style={styles.threadStatus}>
                  <ActivityIndicator color={palette.primary} />
                </View>
              ) : threadErrorKey ? (
                <Text style={[styles.threadStatusText, { color: palette.muted }]}>{t(threadErrorKey)}</Text>
              ) : visibleThreadMessages.length === 0 ? (
                <Text style={[styles.threadStatusText, { color: palette.muted }]}>{t('quiz.emptyItems')}</Text>
              ) : (
                visibleThreadMessages.map((item) => (
                  <Animated.View
                    entering={FadeIn.duration(160)}
                    key={item.id}
                    layout={LinearTransition.duration(180)}
                    style={
                      item.role === 'user'
                        ? [styles.messageBubble, { backgroundColor: palette.primary }]
                        : styles.assistantMessage
                    }
                  >
                    {isQuizMode && item.role === 'assistant' && item.quizItemId == null && item.questionText ? (
                      <Text style={[styles.messageText, { color: palette.text }]}>
                        <Text style={styles.quizQuestionNumber}>{item.questionNo ?? ''}.</Text>
                        {` ${item.questionText}`}
                      </Text>
                    ) : isQuizMode && item.role === 'assistant' && item.quizItemId == null && item.answerText != null ? (
                      <Text style={[styles.messageText, { color: palette.text }]}>
                        {renderAnswerRevealText(item, t('chat.answerLabel'))}
                      </Text>
                    ) : item.role === 'assistant' && item.quizItemId != null ? (
                      <View style={styles.quizItemContent}>
                        <Text style={[styles.quizItemTitle, { color: palette.text }]}>
                          {t('chat.questionNumber', { n: item.questionNo ?? '' })}
                        </Text>
                        <View style={styles.quizItemRow}>
                          <Text style={[styles.quizItemLabel, { color: palette.text }]}>{t('chat.questionLabel')}</Text>
                          <Text style={[styles.quizItemValue, { color: palette.text }]}>{item.questionText}</Text>
                        </View>
                        <View style={styles.quizItemRow}>
                          <Text style={[styles.quizItemLabel, { color: palette.text }]}>{t('chat.answerLabel')}</Text>
                          <Text style={[styles.quizItemValue, { color: palette.text }]}>{item.answerText}</Text>
                        </View>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.messageText,
                          { color: item.role === 'user' ? palette.primaryText : palette.text },
                        ]}
                      >
                        {renderMessageText(item)}
                      </Text>
                    )}
                    {item.role === 'assistant' && !isQuizMode && item.quizItemId != null ? (
                      <View style={styles.messageActions}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('chat.copyMessage')}
                          hitSlop={8}
                          onPress={() => handleCopyMessage(item.text)}
                          style={({ pressed }) => [styles.messageActionButton, pressed && { opacity: 0.55 }]}
                        >
                          <Ionicons name="copy-outline" size={18} color={messageActionIconColor} />
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={t('chat.editItem')}
                          hitSlop={8}
                          onPress={() => {
                            const quizItemId = item.quizItemId;
                            if (quizItemId == null) return;

                            openEditQuizItemScreen(
                              quizItemId,
                              item.questionText ?? '',
                              item.answerText ?? ''
                            );
                          }}
                          style={({ pressed }) => [styles.messageActionButton, pressed && { opacity: 0.55 }]}
                        >
                          <Ionicons name="create-outline" size={18} color={messageActionIconColor} />
                        </Pressable>
                      </View>
                    ) : null}
                  </Animated.View>
                ))
              )}
              {quizSessionCompleted ? (
                <View style={styles.quizResultActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('quiz.restartQuiz')}
                    hitSlop={8}
                    onPress={restartQuiz}
                    style={({ pressed }) => [
                      styles.quizResultButton,
                      { backgroundColor: quizStartButtonBackground },
                      pressed && { opacity: 0.78 },
                    ]}
                  >
                    <Text style={[styles.quizResultButtonText, { color: quizStartButtonForeground }]}>
                      {t('quiz.restartQuiz')}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('quiz.retryWrongOnly')}
                    disabled={!hasWrongQuizItems}
                    hitSlop={8}
                    onPress={retryWrongQuizItems}
                    style={({ pressed }) => [
                      styles.quizResultButton,
                      {
                        backgroundColor: hasWrongQuizItems ? quizStartButtonBackground : palette.gray200,
                      },
                      pressed && hasWrongQuizItems && { opacity: 0.78 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.quizResultButtonText,
                        { color: hasWrongQuizItems ? quizStartButtonForeground : palette.muted },
                      ]}
                    >
                      {t('quiz.retryWrongOnly')}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
              <Text style={[styles.promptTitle, { color: palette.text }]}>{t('home.promptTitle')}</Text>
              <View style={[styles.exampleBox, { backgroundColor: palette.card }]}>
                <Text style={[styles.exampleTitle, { color: palette.text }]}>{t('home.exampleTitle')}</Text>
                {exampleQuizPrompts.map((example) => (
                  <View key={example} style={styles.exampleRow}>
                    <Text style={[styles.exampleBullet, { color: palette.muted }]}>{'\u2022'}</Text>
                    <Text style={[styles.exampleText, { color: palette.muted }]}>{example}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
              <Text style={[styles.exampleTitle, styles.adTitle, { color: palette.text }]}>{t('common.ad')}</Text>
              <View style={styles.adSlot}>
                <AdMobBanner300x250 />
              </View>
            </Animated.View>
          )}
        </KeyboardChatScrollView>
        {selectedChatId != null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isQuizMode ? t('quiz.startEdit') : t('quiz.startQuiz')}
            hitSlop={8}
            onPress={toggleQuizMode}
            style={({ pressed }) => [
              styles.startQuizButton,
              { backgroundColor: quizStartButtonBackground, borderColor: quizStartButtonBackground },
              pressed && { opacity: 0.78 },
            ]}
          >
            <Ionicons
              name={isQuizMode ? 'create-outline' : 'play-circle-outline'}
              size={23}
              color={quizStartButtonForeground}
            />
            <Text style={[styles.startQuizButtonText, { color: quizStartButtonForeground }]}>
              {isQuizMode ? t('quiz.startEdit') : t('quiz.startQuiz')}
            </Text>
          </Pressable>
        ) : null}
        <KeyboardStickyView
          enabled={isFocused}
          offset={{ opened: keyboardOffset }}
          onLayout={(event) => handleComposerLayout(event.nativeEvent.layout.height)}
          style={[styles.composerShell, { backgroundColor: palette.background }]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.composerKeyboardBackground,
              {
                height: Math.max(keyboardOffset, 0),
                bottom: -Math.max(keyboardOffset, 0),
                backgroundColor: palette.background,
              },
            ]}
          />
          <View style={styles.composerRow}>
            <View
              style={[
                styles.inputBox,
                {
                  minHeight: inputHeight,
                  backgroundColor: palette.gray200,
                  borderColor: palette.border,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                nativeID={CHAT_INPUT_NATIVE_ID}
                multiline
                {...CHAT_COMPOSER_TEXT_INPUT_PROPS}
                maxLength={1000}
                onChangeText={setMessage}
                onContentSizeChange={handleContentSizeChange}
                onSubmitEditing={handleSend}
                placeholder={t('chat.messagePlaceholder')}
                placeholderTextColor={palette.placeholder}
                returnKeyType="send"
                selectionColor={palette.primary}
                cursorColor={palette.primary}
                style={[styles.messageInput, { color: palette.text }]}
                submitBehavior="submit"
                value={message}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('chat.sendButton')}
              disabled={!canSend}
              hitSlop={8}
              onPress={handleSend}
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            >
              <Ionicons name="send" size={28} color={canSend ? palette.primary : palette.iconMuted} />
            </Pressable>
          </View>
        </KeyboardStickyView>
      </KeyboardGestureArea>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  chatHeaderAd: {
    width: '100%',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startQuizButton: {
    position: 'absolute',
    right: 16,
    bottom: 76,
    zIndex: 10,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 22,
  },
  startQuizButtonText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  scrollContent: { paddingHorizontal: 0 },
  threadScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  threadContent: {
    gap: 8,
  },
  threadStatus: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadStatusText: {
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 21,
  },
  messageBubble: {
    maxWidth: '78%',
    alignSelf: 'flex-end',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  assistantMessage: {
    maxWidth: '100%',
    alignSelf: 'flex-start',
    paddingVertical: 10,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 12,
  },
  messageActionButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextStrong: {
    fontWeight: '700',
  },
  quizItemContent: {
    gap: 8,
  },
  quizItemTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  quizItemRow: {
    gap: 3,
  },
  quizItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  quizItemValue: {
    fontSize: 15,
    lineHeight: 21,
  },
  quizQuestionNumber: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  quizResultActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
  },
  quizResultButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  quizResultButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  promptTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center',
  },
  exampleBox: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  exampleTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  exampleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  exampleBullet: {
    fontSize: 16,
    lineHeight: 22,
  },
  exampleText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginTop: 24,
  },
  adSlot: {
    width: '100%',
    height: 250,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adTitle: {
    marginHorizontal: 32,
    marginTop: 24,
  },
  composerShell: {
    paddingHorizontal: 12,
    paddingTop: COMPOSER_TOP_PADDING,
  },
  composerKeyboardBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inputBox: {
    flex: 1,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  messageInput: {
    fontSize: 16,
    lineHeight: COMPOSER_LINE_HEIGHT,
    maxHeight: COMPOSER_MAX_INPUT_HEIGHT,
    paddingVertical: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.65,
  },
});
