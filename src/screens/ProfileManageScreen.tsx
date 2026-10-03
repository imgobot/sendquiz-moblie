import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { getMyProfile, updateMyNickname, withdrawMyAccount } from '../services/profileApi';
import { msg } from '../constants/appMessages';
import { clearAccessToken } from '../services/authedFetch';
import AuthModal from '../components/AuthModal';

export default function ProfileManageScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [hasPasswordLogin, setHasPasswordLogin] = useState(false);
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [showPasswordAuth, setShowPasswordAuth] = useState(false);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const me = await getMyProfile();
        if (!isActive) return;
        setEmail(me.email ?? '');
        setHasPasswordLogin(me.hasPasswordLogin);
        setNickname(me.nickname ?? '');
      } catch {
        if (!isActive) return;
        Alert.alert('', msg(t, 'PROFILE_LOAD_FAILED'));
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [t]);

  const handleUpdateNickname = useCallback(async () => {
    const trimmed = newNickname.trim();
    if (!trimmed) {
      Alert.alert('', msg(t, 'AUTH_NICKNAME_REQUIRED'));
      return;
    }

    try {
      await updateMyNickname(trimmed);
      setNickname(trimmed);
      setEditingNickname(false);
      Alert.alert('', msg(t, 'PROFILE_NICKNAME_UPDATED'));
    } catch {
      Alert.alert('', msg(t, 'PROFILE_NICKNAME_UPDATE_FAILED'));
    }
  }, [newNickname, t]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(msg(t, 'PROFILE_WITHDRAW_TITLE'), msg(t, 'PROFILE_DELETE_CONFIRM'), [
      { text: msg(t, 'PROFILE_WITHDRAW_CANCEL'), style: 'cancel' },
      {
        text: msg(t, 'PROFILE_WITHDRAW_CONFIRM'),
        style: 'destructive',
        onPress: async () => {
            try {
              await withdrawMyAccount();
              await clearAccessToken();
              router.back();
          } catch {
            Alert.alert('', msg(t, 'PROFILE_DELETE_FAILED'));
          }
        },
      },
    ]);
  }, [router, t]);

  const startEditNickname = useCallback(() => {
    setNewNickname(nickname);
    setEditingNickname(true);
  }, [nickname]);

  const openPasswordAuth = useCallback(() => setShowPasswordAuth(true), []);
  const handlePasswordChanged = useCallback(async () => {
    setShowPasswordAuth(false);
    await clearAccessToken();
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.card }]} edges={[]}>
      <Stack.Screen options={{ title: t('profile.title') }} />
      <View style={styles.content}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: palette.muted }]}>{t('profile.email')}</Text>
          <Text style={[styles.value, { color: palette.text }]}>{email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: palette.muted }]}>{t('profile.nickname')}</Text>
          {editingNickname ? (
            <View style={styles.editRow}>
              <TextInput
                style={[styles.input, { borderBottomColor: palette.primary, color: palette.text }]}
                value={newNickname}
                onChangeText={setNewNickname}
                selectionColor={palette.primary}
                cursorColor={palette.primary}
                autoFocus
              />
              <TouchableOpacity onPress={handleUpdateNickname}>
                <Text style={[styles.saveButton, { color: palette.primary }]}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editRow}>
              <Text style={[styles.value, { color: palette.text }]}>{nickname}</Text>
              <TouchableOpacity onPress={startEditNickname}>
                <Text style={[styles.editButton, { color: palette.primary }]}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {hasPasswordLogin ? (
          <TouchableOpacity
            style={[styles.passwordButton, { borderTopColor: palette.border }]}
            onPress={openPasswordAuth}
          >
            <Text style={[styles.passwordButtonText, { color: palette.text }]}>{t('profile.changePassword')}</Text>
            <Ionicons name="chevron-forward" size={20} color={palette.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity style={[styles.deleteButton, { borderColor: palette.error }]} onPress={handleDeleteAccount}>
        <Text style={[styles.deleteButtonText, { color: palette.error }]}>{t('profile.withdraw')}</Text>
      </TouchableOpacity>
      <AuthModal
        initialMode="change-password"
        visible={showPasswordAuth}
        onClose={() => setShowPasswordAuth(false)}
        onAuth={handlePasswordChanged}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  field: { marginBottom: 24 },
  label: { fontSize: 13, marginBottom: 8 },
  value: { fontSize: 16 },
  editRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { flex: 1, fontSize: 16, borderBottomWidth: 1, paddingVertical: 4, marginRight: 12 },
  editButton: { fontSize: 14 },
  saveButton: { fontSize: 14, fontWeight: '600' },
  passwordButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 0.5 },
  passwordButtonText: { fontSize: 16 },
  deleteButton: { marginHorizontal: 20, marginTop: 'auto', marginBottom: 40, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  deleteButtonText: { fontSize: 16, fontWeight: '600' },
});
