import {
  Button, Form, Host, HStack, Image, Label, LabeledContent,
  Picker, Section, Spacer, Text,
} from '@expo/ui/swift-ui';
import { font, foregroundStyle, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { SFSymbol } from 'sf-symbols-typescript';
import AuthModal from '../components/AuthModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme, type ThemeMode } from '../contexts/ThemeContext';
import { LANGUAGES, useSettingsActions } from './useSettingsActions';

function SettingsLink({ title, icon, onPress }: {
  title: string;
  icon: SFSymbol;
  onPress: () => void;
}) {
  return (
    <Button onPress={onPress}>
      <HStack>
        <Label title={title} systemImage={icon} modifiers={[foregroundStyle({ type: 'hierarchical', style: 'primary' })]} />
        <Spacer />
        <Image systemName="chevron.right" modifiers={[
          font({ textStyle: 'footnote', weight: 'semibold' }),
          foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
        ]} />
      </HStack>
    </Button>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { resolvedTheme, themeMode, setThemeMode, palette } = useTheme();
  const { language, setLanguage } = useLanguage();
  const {
    isLoggedIn, showAuthModal, setShowAuthModal, handleProfilePress,
    handleOpenTerms, handleOpenPrivacy, handleOpenFeedback,
    handleLoginPress, handleLogout, handleAuthSuccess,
  } = useSettingsActions();

  return (
    <>
      <Stack.Screen options={{ title: t('tab.settings') }} />
      <Host style={{ flex: 1 }} colorScheme={resolvedTheme} seedColor={palette.primary}>
        <Form>
          <Section title={t('settings.sectionAccount')}>
            <SettingsLink title={t('settings.profileManage')} icon="person.crop.circle" onPress={handleProfilePress} />
          </Section>
          <Section title={t('settings.sectionAppInfo')}>
            <Picker
              label={t('settings.language')}
              systemImage="globe"
              selection={language}
              onSelectionChange={setLanguage}
              modifiers={[pickerStyle('menu')]}
            >
              {LANGUAGES.map(({ code, name }) => <Text key={code} modifiers={[tag(code)]}>{name}</Text>)}
            </Picker>
            <Picker<ThemeMode>
              label={t('settings.theme')}
              systemImage="circle.lefthalf.filled"
              selection={themeMode}
              onSelectionChange={setThemeMode}
              modifiers={[pickerStyle('menu')]}
            >
              <Text modifiers={[tag('system')]}>{t('settings.themeSystem')}</Text>
              <Text modifiers={[tag('light')]}>{t('settings.themeLight')}</Text>
              <Text modifiers={[tag('dark')]}>{t('settings.themeDark')}</Text>
            </Picker>
            <LabeledContent label={<Label title={t('settings.appVersion')} systemImage="info.circle" />}>
              <Text>{Constants.expoConfig?.version ?? ''}</Text>
            </LabeledContent>
          </Section>
          <Section title={t('settings.sectionSupport')}>
            <SettingsLink title={t('settings.terms')} icon="doc.text" onPress={handleOpenTerms} />
            <SettingsLink title={t('settings.privacy')} icon="hand.raised" onPress={handleOpenPrivacy} />
            <SettingsLink title={t('settings.feedback')} icon="bubble.left.and.bubble.right" onPress={handleOpenFeedback} />
          </Section>
          <Section>
            {isLoggedIn ? (
              <Button label={t('settings.logout')} role="destructive" onPress={handleLogout} />
            ) : (
              <Button label={t('settings.loginSignup')} systemImage="person.crop.circle.badge.plus" onPress={handleLoginPress} />
            )}
          </Section>
        </Form>
      </Host>
      <AuthModal visible={showAuthModal} onClose={() => setShowAuthModal(false)} onAuth={handleAuthSuccess} />
    </>
  );
}
