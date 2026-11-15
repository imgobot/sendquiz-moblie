import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from "expo-router/react-navigation";
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeMode } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthModal from '../components/AuthModal';
import { clearAccessToken, getAccessToken } from '../services/authedFetch';

const LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'pt-BR', name: 'Português (BR)' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'es', name: 'Español' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'de', name: 'Deutsch' },
] as const;

const LANGUAGE_NAMES: Record<string, string> = Object.fromEntries(LANGUAGES.map(l => [l.code, l.name]));
const THEME_OPTIONS: { mode: ThemeMode; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'system', labelKey: 'settings.themeSystem', icon: 'phone-portrait-outline' },
  { mode: 'dark', labelKey: 'settings.themeDark', icon: 'moon-outline' },
  { mode: 'light', labelKey: 'settings.themeLight', icon: 'sunny-outline' },
];

function getLanguageDisplay(code: string): string {
  return LANGUAGE_NAMES[code] ?? code;
}

const DISPLAY_VERSION = Constants.expoConfig?.version ?? '';

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
  palette: any;
};

const SettingItem = memo(({ icon, label, onPress, showArrow = true, palette }: SettingItemProps) => {
  return (
    <TouchableOpacity style={[styles.item, { borderBottomColor: palette.border }]} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={palette.muted} />
        <Text style={[styles.itemLabel, { color: palette.text }]}>{label}</Text>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color={palette.icon} />}
    </TouchableOpacity>
  );
});

const Section = memo(({ title, children, palette }: { title: string; children: React.ReactNode; palette: any }) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.muted }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: palette.card }]}>{children}</View>
    </View>
  );
});

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, palette } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const checkSession = async () => {
        try {
          const token = await getAccessToken();
          if (isActive) {
            setIsLoggedIn(Boolean(token));
          }
        } catch {
          if (isActive) {
            setIsLoggedIn(false);
          }
        }
      };

      checkSession();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleProfilePress = useCallback(() => {
    if (isLoggedIn) {
      router.push('/profile-manage');
    } else {
      setShowAuthModal(true);
    }
  }, [isLoggedIn, router]);
  const handleOpenLanguageModal = useCallback(() => setShowLanguageModal(true), []);
  const handleOpenTerms = useCallback(() => router.push({ pathname: '/policy-webview', params: { document: 'terms' } }), [router]);
  const handleOpenPrivacy = useCallback(() => router.push({ pathname: '/policy-webview', params: { document: 'privacy' } }), [router]);
  const handleOpenFeedback = useCallback(() => router.push('/feedback'), [router]);
  const handleLoginPress = useCallback(() => setShowAuthModal(true), []);
  const handleLogout = useCallback(async () => {
    try {
      await clearAccessToken();
    } finally {
      setIsLoggedIn(false);
    }
  }, []);
  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    setIsLoggedIn(true);
    router.replace('/');
  }, [router]);
  const handleSelectLanguage = useCallback((code: string) => {
    setLanguage(code);
    setShowLanguageModal(false);
  }, [setLanguage]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={[]}>
      <Stack.Screen options={{ title: t('tab.settings') }} />
      <ScrollView style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="always">
        <Section title={t('settings.sectionAccount')} palette={palette}>
        <SettingItem
          icon="person-outline"
          label={t('settings.profileManage')}
          onPress={handleProfilePress}
          palette={palette}
        />
      </Section>

      <Section title={t('settings.sectionAppInfo')} palette={palette}>
        <TouchableOpacity style={[styles.item, { borderBottomColor: palette.border }]} onPress={handleOpenLanguageModal}>
          <View style={styles.itemLeft}>
            <Ionicons name="language-outline" size={22} color={palette.muted} />
            <Text style={[styles.itemLabel, { color: palette.text }]}>{t('settings.language')}</Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={[styles.versionText, { color: palette.muted }]}>{getLanguageDisplay(language)}</Text>
            <Ionicons name="chevron-forward" size={20} color={palette.icon} />
          </View>
        </TouchableOpacity>
        <View style={[styles.item, { borderBottomColor: palette.border }]}>
          <View style={styles.itemLeft}>
            <Ionicons name="contrast-outline" size={22} color={palette.muted} />
            <Text style={[styles.itemLabel, { color: palette.text }]}>{t('settings.theme')}</Text>
          </View>
        </View>
        {THEME_OPTIONS.map((option) => {
          const selected = themeMode === option.mode;

          return (
            <TouchableOpacity
              key={option.mode}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={[
                styles.themeOption,
                { borderBottomColor: palette.border },
              ]}
              onPress={() => setThemeMode(option.mode)}
            >
              <View style={styles.itemLeft}>
                <Ionicons name={option.icon} size={22} color={palette.muted} />
                <Text style={[styles.itemLabel, { color: palette.text }]}>{t(option.labelKey)}</Text>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={selected ? palette.primary : palette.icon}
              />
            </TouchableOpacity>
          );
        })}
        <View style={[styles.item, { borderBottomColor: palette.border }]}>
          <View style={styles.itemLeft}>
            <Ionicons name="information-circle-outline" size={22} color={palette.muted} />
            <Text style={[styles.itemLabel, { color: palette.text }]}>{t('settings.appVersion')}</Text>
          </View>
          <Text style={[styles.versionText, { color: palette.muted }]}>{DISPLAY_VERSION}</Text>
        </View>
      </Section>

      <Section title={t('settings.sectionSupport')} palette={palette}>
        <SettingItem icon="document-text-outline" label={t('settings.terms')} onPress={handleOpenTerms} palette={palette} />
        <SettingItem icon="shield-checkmark-outline" label={t('settings.privacy')} onPress={handleOpenPrivacy} palette={palette} />
        <SettingItem icon="chatbubble-ellipses-outline" label={t('settings.feedback')} onPress={handleOpenFeedback} palette={palette} />
      </Section>

      <View style={styles.authSection}>
        {isLoggedIn ? (
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: palette.error }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={palette.error} />
            <Text style={[styles.logoutButtonText, { color: palette.error }]}>{t('settings.logout')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.authButton, { borderColor: palette.primary }]} onPress={handleLoginPress}>
            <Ionicons name="log-in-outline" size={20} color={palette.primary} />
            <Text style={[styles.authButtonText, { color: palette.primary }]}>{t('settings.loginSignup')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuthSuccess}
      />

      <Modal visible={showLanguageModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLanguageModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: palette.card }]}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>{t('settings.language')}</Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langOption, { borderBottomColor: palette.border }]}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <Text style={[styles.langText, { color: palette.text }]}>{lang.name}</Text>
                {language === lang.code && <Ionicons name="checkmark" size={20} color={palette.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginLeft: 20, marginBottom: 8 },
  sectionContent: {},
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 0.5 },
  themeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 20, paddingLeft: 52, borderBottomWidth: 0.5 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemLabel: { fontSize: 16 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  versionText: { fontSize: 14 },
  authSection: { marginTop: 32, paddingHorizontal: 20, gap: 12 },
  authButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  authButtonText: { fontSize: 16, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  logoutButtonText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  langOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  langText: { fontSize: 16 },
});
