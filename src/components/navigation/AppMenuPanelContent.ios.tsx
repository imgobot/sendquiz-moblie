import {
  Button,
  Host,
  HStack,
  Image,
  List,
  NavigationStack,
  ProgressView,
  Section,
  Spacer,
  Text,
  Toolbar,
  ToolbarItem,
} from '@expo/ui/swift-ui';
import {
  font,
  fixedSize,
  foregroundStyle,
  frame,
  lineLimit,
  listStyle,
  navigationBarTitleDisplayMode,
  navigationTitle,
} from '@expo/ui/swift-ui/modifiers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { msg } from '../../constants/appMessages';
import { useTheme } from '../../contexts/ThemeContext';
import type { QuizChat } from '../../services/quizApi';
import { useMenuPanelContent, type AppMenuPanelContentProps } from './useMenuPanelContent';

export default function AppMenuPanelContent(props: AppMenuPanelContentProps) {
  const { chats, isLoading, messageText, openChat, handleNewQuiz } = useMenuPanelContent(props);
  const { resolvedTheme, palette } = useTheme();
  const { t } = useTranslation();

  const renderChat = useCallback(
    ({ item }: { item: QuizChat }) => (
      <Button onPress={() => openChat(item)}>
        <Text modifiers={[lineLimit(1)]}>{item.name}</Text>
      </Button>
    ),
    [openChat]
  );

  return (
    <Host style={{ flex: 1 }} colorScheme={resolvedTheme} seedColor={palette.text}>
      <NavigationStack>
        <Toolbar>
          <List modifiers={[
            listStyle('sidebar'),
            navigationTitle(''),
            navigationBarTitleDisplayMode('inline'),
          ]}>
            <Section title={t('menu.recent')}>
              {isLoading ? (
                <ProgressView />
              ) : chats.length === 0 ? (
                <Text modifiers={[foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
                  {messageText ?? msg(t, 'QUIZ_EMPTY_CHATS')}
                </Text>
              ) : (
                <List.ForEach data={chats} keyExtractor={(chat) => String(chat.id)}>
                  {renderChat}
                </List.ForEach>
              )}
            </Section>
          </List>
          <Toolbar.Content>
            <ToolbarItem placement="principal">
              <HStack modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}>
                <Text modifiers={[
                  font({ size: 20, weight: 'heavy' }),
                  lineLimit(1),
                  fixedSize({ horizontal: true, vertical: false }),
                ]}>SEND</Text>
                <Spacer />
              </HStack>
            </ToolbarItem>
            <ToolbarItem placement="bottomBar">
              <HStack modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}>
                <Button onPress={handleNewQuiz}>
                  <HStack spacing={8} modifiers={[fixedSize({ horizontal: true, vertical: false })]}>
                    <Image systemName="square.and.pencil" size={20} />
                    <Text modifiers={[lineLimit(1)]}>{t('quiz.newQuizButton')}</Text>
                  </HStack>
                </Button>
                <Spacer />
              </HStack>
            </ToolbarItem>
          </Toolbar.Content>
        </Toolbar>
      </NavigationStack>
    </Host>
  );
}
