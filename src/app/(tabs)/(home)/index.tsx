import { TabHeader } from '../../../components/navigation/TabHeader';
import { AdMobNativeAd } from '../../../components/ads';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';
import { msg } from '../../../constants/appMessages';
import { useQuizThread } from '../../../contexts/QuizThreadContext';
import { useButtonBlue, useTheme } from '../../../contexts/ThemeContext';
import type { QuizChat } from '../../../services/quizApi';
import { listAccessibleQuizChats } from '../../../services/quizRepository';
import { isAuthRequiredError } from '../../../utils/errors';

export default function HomeScreen() {
  const router = useRouter();
  const { selectChat, startNewChat } = useQuizThread();
  const { palette } = useTheme();
  const buttonBlue = useButtonBlue();
  const { t, i18n } = useTranslation();
  const dateFormat = useMemo(() => new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric', month: 'short', day: 'numeric',
  }), [i18n.language]);
  const [chats, setChats] = useState<QuizChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    listAccessibleQuizChats().then(items => {
      if (active) setChats(items);
    }).catch(cause => {
      if (active) {
        setChats([]);
        setError(msg(t, isAuthRequiredError(cause) ? 'QUIZ_LOGIN_REQUIRED' : 'QUIZ_LOAD_CHATS_FAILED'));
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [t]));

  function openQuiz(chat?: QuizChat) {
    if (chat) void selectChat(chat);
    else startNewChat();
    router.push('/home/quiz');
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TabHeader title={t('tab.home')} />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        ListHeaderComponent={AdMobNativeAd}
        data={chats}
        keyExtractor={chat => String(chat.id)}
        renderItem={({ item }) => {
          const date = new Date(item.updatedAt);
          return (
            <Pressable accessibilityRole="button" onPress={() => openQuiz(item)}
              style={({ pressed }) => [styles.row, { borderColor: palette.border, opacity: pressed ? 0.65 : 1 }]}>
              <View style={styles.heading}>
                <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>{item.name}</Text>
                <Text style={[styles.date, { color: palette.muted }]}>
                  {Number.isNaN(date.getTime()) ? '' : dateFormat.format(date)}
                </Text>
              </View>
              <Text style={{ color: palette.muted }}>{t('home.quizPreview')}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={loading ? <ActivityIndicator color={palette.primary} /> : (
          <Text style={[styles.empty, { color: palette.muted }]}>{error || t('quiz.emptyChats')}</Text>
        )}
      />
      <SafeAreaView pointerEvents="box-none" edges={{ bottom: true }} style={styles.overlay}>
        <Pressable accessibilityRole="button" onPress={() => openQuiz()}
          style={({ pressed }) => [styles.createButton, { backgroundColor: buttonBlue, opacity: pressed ? 0.8 : 1 }]}>
          <Text style={styles.createLabel}>{t('quiz.newQuizButton')}</Text>
        </Pressable>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 16, paddingBottom: 88 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
  createButton: { minWidth: 192, minHeight: 50, marginBottom: 12, paddingHorizontal: 24,
    borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  createLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  row: { paddingVertical: 16, gap: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 17, fontWeight: '600' },
  date: { fontSize: 13 },
  empty: { paddingVertical: 24, textAlign: 'center' },
});
