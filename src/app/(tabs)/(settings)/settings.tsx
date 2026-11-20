import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AuthModal from '../../../components/AuthModal';
import { TabHeader } from '../../../components/navigation/TabHeader';
import { TabContentAd } from '../../../components/ads/TabContentAd';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme, type ThemeMode } from '../../../contexts/ThemeContext';
import { LANGUAGES, useSettingsActions } from '../../../hooks/useSettingsActions';

const modes: ThemeMode[] = ['system', 'light', 'dark'];
const themeLabels = { system: 'settings.themeSystem', light: 'settings.themeLight', dark: 'settings.themeDark' };

function Section({ title, children }: { title?: string; children: ReactNode }) {
  const { palette, isDark } = useTheme();
  return (
    <View style={styles.section}>
      {title && <Text style={[styles.caption, { color: palette.muted }]}>{title}</Text>}
      <View style={[styles.group, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, onPress, divider, destructive }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value?: string;
  onPress?: () => void; divider?: boolean; destructive?: boolean;
}) {
  const { palette } = useTheme();
  const color = destructive ? palette.error : palette.text;
  const content = (
    <>
      <Ionicons name={icon} size={22} color={color} />
      <View style={[styles.rowContent, divider && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: palette.border }]}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        {value && <Text style={[styles.value, { color: palette.muted }]}>{value}</Text>}
        {onPress && <Ionicons name={value ? 'chevron-expand' : 'chevron-forward'} size={15} color={palette.icon} />}
      </View>
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      {content}
    </Pressable>
  ) : <View style={styles.row}>{content}</View>;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { isDark, palette, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const actions = useSettingsActions();
  const [picker, setPicker] = useState<'language' | 'theme' | null>(null);
  const options = picker === 'theme'
    ? modes.map(mode => ({ key: mode, label: t(themeLabels[mode]), select: () => setThemeMode(mode) }))
    : LANGUAGES.map(lang => ({ key: lang.code, label: lang.name, select: () => setLanguage(lang.code) }));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TabHeader title={t('tab.settings')} />
      <ScrollView
        contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <TabContentAd />
        <Section title={t('settings.sectionAccount')}>
          <Row icon="person-circle-outline" label={t('settings.profileManage')} onPress={actions.handleProfilePress} />
        </Section>
        <Section title={t('settings.sectionAppInfo')}>
          <Row icon="globe-outline" label={t('settings.language')} divider
            value={LANGUAGES.find(lang => lang.code === language)?.name ?? language} onPress={() => setPicker('language')} />
          <Row icon="contrast-outline" label={t('settings.theme')} divider
            value={t(themeLabels[themeMode])} onPress={() => setPicker('theme')} />
          <Row icon="information-circle-outline" label={t('settings.appVersion')} value={Constants.expoConfig?.version} />
        </Section>
        <Section title={t('settings.sectionSupport')}>
          <Row icon="document-text-outline" label={t('settings.terms')} divider onPress={actions.handleOpenTerms} />
          <Row icon="hand-left-outline" label={t('settings.privacy')} divider onPress={actions.handleOpenPrivacy} />
          <Row icon="chatbubble-ellipses-outline" label={t('settings.feedback')} onPress={actions.handleOpenFeedback} />
        </Section>
        <Section>
          {actions.isLoggedIn
            ? <Row icon="log-out-outline" label={t('settings.logout')} destructive onPress={actions.handleLogout} />
            : <Row icon="log-in-outline" label={t('settings.loginSignup')} onPress={actions.handleLoginPress} />}
        </Section>
      </ScrollView>
      <AuthModal visible={actions.showAuthModal} onClose={() => actions.setShowAuthModal(false)} onAuth={actions.handleAuthSuccess} />
      <Modal visible={picker !== null} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel={t('common.close')}
            onPress={() => setPicker(null)} />
          <View style={[styles.sheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={[styles.sheetTitle, { color: palette.text }]}>{t(picker === 'theme' ? 'settings.theme' : 'settings.language')}</Text>
            <ScrollView>
              {options.map(option => {
                const selected = option.key === (picker === 'theme' ? themeMode : language);
                return (
                  <Pressable key={option.key} accessibilityRole="radio" accessibilityState={{ checked: selected }}
                    style={styles.option} onPress={() => { option.select(); setPicker(null); }}>
                    <Text style={[styles.label, { color: palette.text }]}>{option.label}</Text>
                    {selected && <Ionicons name="checkmark" size={20} color={palette.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  section: { marginTop: 24 },
  caption: { marginLeft: 16, marginBottom: 7, fontSize: 13 },
  group: { borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, gap: 12 },
  rowContent: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 16, paddingVertical: 9 },
  label: { flex: 1, fontSize: 16 },
  value: { flexShrink: 1, fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 28 },
  sheet: { borderRadius: 18, maxHeight: '80%', padding: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 8 },
});
