import { Button, Host, HStack, Image, TextField, useNativeState, type TextFieldRef } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  autocorrectionDisabled,
  buttonStyle,
  disabled,
  font,
  frame,
  glassEffect,
  lineLimit,
  onSubmit,
  padding,
  submitLabel,
  textFieldStyle,
  textInputAutocapitalization,
} from '@expo/ui/swift-ui/modifiers';
import { useEffect, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import type { ChatComposerProps } from './ChatComposer.types';

export default function ChatComposer({ ref, value, canSend, onChangeText, onSend, onHeightChange }: ChatComposerProps) {
  const inputRef = useRef<TextFieldRef>(null);
  const text = useNativeState(value);
  const { resolvedTheme, palette } = useTheme();
  const { t } = useTranslation();

  useImperativeHandle(ref, () => ({ focus: () => { void inputRef.current?.focus(); } }), []);

  useEffect(() => {
    // Native edits already update this state. Only write external changes (send/reset/retry).
    if (text.get() !== value) text.set(value);
  }, [text, value]);

  return (
    <Host style={{ width: '100%' }} matchContents={{ vertical: true }}
      ignoreSafeArea="all" colorScheme={resolvedTheme} seedColor={palette.primary}
      onLayoutContent={({ nativeEvent }) => onHeightChange(nativeEvent.height)}>
      <HStack alignment="bottom" spacing={4} modifiers={[
        padding({ all: 6 }),
        glassEffect({ glass: { variant: 'regular' }, shape: 'roundedRectangle', cornerRadius: 28 }),
      ]}>
        <TextField ref={inputRef} text={text} axis="vertical" maxLength={1000}
          placeholder={t('chat.messagePlaceholder')} onTextChange={onChangeText}
          modifiers={[
            textFieldStyle('plain'),
            font({ textStyle: 'body' }),
            lineLimit({ min: 1, max: 5 }),
            padding({ leading: 12, trailing: 4, top: 10, bottom: 10 }),
            frame({ maxWidth: Infinity, minHeight: 44 }),
            autocorrectionDisabled(),
            textInputAutocapitalization('never'),
            submitLabel('send'),
            onSubmit(() => { if (canSend) onSend(); }),
            accessibilityLabel(t('chat.messagePlaceholder')),
          ]} />
        <Button onPress={onSend} modifiers={[
          buttonStyle('plain'),
          frame({ width: 44, height: 44 }),
          disabled(!canSend),
          accessibilityLabel(t('chat.sendButton')),
        ]}>
          <Image systemName="arrow.up.circle.fill" size={34} color={canSend ? palette.primary : palette.iconMuted} />
        </Button>
      </HStack>
    </Host>
  );
}
