import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as StoreReview from 'expo-store-review';
import { useIsFocused } from "expo-router/react-navigation";
import { Stack, useNavigation, useRouter } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import type { ParamListBase } from 'expo-router/react-navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { KeyboardGestureArea, KeyboardStickyView, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AdMobNativeAd } from '../components/ads';
import MenuIcon from '@expo/material-symbols/menu.xml';
import AccountIcon from '@expo/material-symbols/account_circle.xml';
import EditIcon from '@expo/material-symbols/edit.xml';
import { msg } from '../constants/appMessages';
import ChatComposer from '../components/chat/ChatComposer';
import { CHAT_INPUT_NATIVE_ID, COMPOSER_MIN_HEIGHT, type ChatComposerHandle } from '../components/chat/ChatComposer.types';
import { useQuizThread, type ThreadMessage } from '../contexts/QuizThreadContext';
import { useTheme } from '../contexts/ThemeContext';
import { isAuthRequiredError } from '../utils/errors';

const COMPOSER_SPACING = 8;

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

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [activeQuizItems, setActiveQuizItems] = useState<ThreadMessage[]>([]);
  const [wrongQuizItems, setWrongQuizItems] = useState<ThreadMessage[]>([]);
  const [quizSessionMessages, setQuizSessionMessages] = useState<ThreadMessage[]>([]);
  const [composerHeight, setComposerHeight] = useState(0);
  const router = useRouter();
  const drawer = useNavigation<DrawerNavigationProp<ParamListBase>>('/');
  const isFocused = useIsFocused();
  const inputRef = useRef<ChatComposerHandle>(null);
  const quizMessageIdRef = useRef(0);
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
  const { progress: keyboardProgress } = useReanimatedKeyboardAnimation();
  const composerSafeAreaStyle = useAnimatedStyle(() => ({
    paddingBottom: COMPOSER_SPACING + insets.bottom * (1 - keyboardProgress.value),
  }));
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

  const handleComposerLayout = useCallback((height: number) => {
    setComposerHeight(height);
  }, []);

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
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Stack.Screen options={{ title: isThreadOpen ? displayedChatTitle : '' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon={process.env.EXPO_OS === 'ios' ? 'line.3.horizontal' : MenuIcon}
          accessibilityLabel={t('menu.open')} onPress={() => drawer.openDrawer()} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        {!isThreadOpen ? (
          <Stack.Toolbar.Button icon={process.env.EXPO_OS === 'ios' ? 'person.crop.circle' : AccountIcon}
            accessibilityLabel={t('tab.settings')} onPress={() => router.push('/settings')} />
        ) : !isQuizMode ? (
          <Stack.Toolbar.Button icon={process.env.EXPO_OS === 'ios' ? 'pencil' : EditIcon}
            accessibilityLabel={t('quiz.renameChatTitle')} onPress={openRenameScreen} />
        ) : null}
      </Stack.Toolbar>
      <KeyboardGestureArea
        interpolator="ios"
        offset={COMPOSER_MIN_HEIGHT}
        style={styles.container}
        textInputNativeID={process.env.EXPO_OS === 'ios' ? undefined : CHAT_INPUT_NATIVE_ID}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            isThreadOpen && styles.threadScrollContent,
            { paddingBottom: Math.max(composerHeight, COMPOSER_MIN_HEIGHT) + COMPOSER_SPACING * 2 + 16 },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets={false}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {selectedChatId != null ? (
            <View style={[styles.chatHeaderAd, { backgroundColor: palette.background }]}>
              <AdMobNativeAd />
            </View>
          ) : null}
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
              <AdMobNativeAd />
            </Animated.View>
          )}
        </ScrollView>
        <KeyboardStickyView enabled={isFocused} style={styles.composerShell}>
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
          <Animated.View style={composerSafeAreaStyle}>
            <ChatComposer ref={inputRef} value={message} canSend={canSend}
              onChangeText={setMessage} onSend={handleSend} onHeightChange={handleComposerLayout} />
          </Animated.View>
        </KeyboardStickyView>
      </KeyboardGestureArea>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  chatHeaderAd: {
    marginHorizontal: -16,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startQuizButton: {
    position: 'absolute',
    right: 16,
    bottom: '100%',
    marginBottom: COMPOSER_SPACING,
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
  composerShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: COMPOSER_SPACING,
  },
});
