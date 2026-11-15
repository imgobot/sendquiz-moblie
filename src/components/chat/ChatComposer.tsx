import { Ionicons } from '@expo/vector-icons';
import { useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';
import { CHAT_COMPOSER_TEXT_INPUT_PROPS } from '../../constants/textInput';
import { useTheme } from '../../contexts/ThemeContext';
import { CHAT_INPUT_NATIVE_ID, COMPOSER_MIN_HEIGHT, type ChatComposerProps } from './ChatComposer.types';

export default function ChatComposer({ ref, value, canSend, onChangeText, onSend, onHeightChange }: ChatComposerProps) {
  const inputRef = useRef<TextInputInstance>(null);
  const { palette } = useTheme();
  const { t } = useTranslation();
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

  return (
    <View onLayout={({ nativeEvent }) => onHeightChange(nativeEvent.layout.height)}
      style={[styles.container, { backgroundColor: palette.gray200, borderColor: palette.border }]}>
      <TextInput ref={inputRef} nativeID={CHAT_INPUT_NATIVE_ID} value={value}
        onChangeText={onChangeText} onSubmitEditing={onSend} multiline maxLength={1000}
        {...CHAT_COMPOSER_TEXT_INPUT_PROPS}
        placeholder={t('chat.messagePlaceholder')} placeholderTextColor={palette.placeholder}
        accessibilityLabel={t('chat.messagePlaceholder')}
        selectionColor={palette.primary} cursorColor={palette.primary}
        returnKeyType="send" submitBehavior="submit" style={[styles.input, { color: palette.text }]} />
      <Pressable accessibilityRole="button" accessibilityLabel={t('chat.sendButton')}
        disabled={!canSend} onPress={onSend} style={styles.sendButton}>
        <Ionicons name="arrow-up-circle" size={34} color={canSend ? palette.primary : palette.iconMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: COMPOSER_MIN_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth, padding: 6 },
  input: { flex: 1, fontSize: 16, lineHeight: 20, minHeight: 44, maxHeight: 120,
    paddingLeft: 12, paddingRight: 4, paddingVertical: 10 },
  sendButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
