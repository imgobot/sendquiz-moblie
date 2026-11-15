import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { msg } from '../../constants/appMessages';
import { useTheme } from '../../contexts/ThemeContext';
import type { QuizChat } from '../../services/quizApi';

import { useMenuPanelContent, type AppMenuPanelContentProps } from './useMenuPanelContent';

export default function AppMenuPanelContent(props: AppMenuPanelContentProps) {
  const { onClose } = props;
  const { chats, isLoading, messageText, openChat, handleNewQuiz, handleOpenSettings } = useMenuPanelContent(props);
  const { isDark, palette } = useTheme();
  const { t } = useTranslation();
  const newQuizButtonBackground = isDark ? '#FFFFFF' : '#111111';
  const newQuizButtonForeground = isDark ? '#111111' : '#FFFFFF';

  const renderChat = useCallback(
    ({ item }: { item: QuizChat }) => (
      <Pressable
        accessibilityRole="button"
        onPress={() => openChat(item)}
        style={({ pressed }) => [
          styles.chatRow,
          pressed && { backgroundColor: palette.gray200 },
        ]}
      >
        <Text numberOfLines={1} style={[styles.chatName, { color: palette.text }]}>
          {item.name}
        </Text>
      </Pressable>
    ),
    [openChat, palette.gray200, palette.text]
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: palette.card }}>
        <View style={styles.header}>
          <Text
            numberOfLines={1}
            style={{ color: palette.text, fontSize: 20, fontWeight: '800', paddingHorizontal: 4 }}
          >
            SEND
          </Text>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('tab.settings')}
              hitSlop={8}
              onPress={handleOpenSettings}
              style={styles.headerActionButton}
            >
              <Ionicons name="settings-outline" size={24} color={palette.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('menu.close')}
              hitSlop={8}
              onPress={onClose}
              style={styles.headerActionButton}
            >
              <Ionicons name="close-outline" size={30} color={palette.text} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      <FlatList
        data={chats}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderChat}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>{t('menu.recent')}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('quiz.newQuizButton')}
              hitSlop={8}
              onPress={handleNewQuiz}
              style={({ pressed }) => [
                styles.newQuizButton,
                { backgroundColor: newQuizButtonBackground, borderColor: newQuizButtonBackground },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Ionicons name="create-outline" size={23} color={newQuizButtonForeground} />
              <Text style={[styles.newQuizButtonText, { color: newQuizButtonForeground }]}>
                {t('quiz.newQuizButton')}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            {isLoading ? (
              <ActivityIndicator color={palette.primary} />
            ) : (
              <Text style={[styles.emptyText, { color: palette.muted }]}>
                {messageText ?? msg(t, 'QUIZ_EMPTY_CHATS')}
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 28,
    paddingBottom: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  newQuizButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 22,
  },
  newQuizButtonText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  chatRow: {
    minHeight: 54,
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '500',
  },
  emptyBox: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
