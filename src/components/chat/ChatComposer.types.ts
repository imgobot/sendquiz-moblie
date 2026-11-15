import type { Ref } from 'react';

export const CHAT_INPUT_NATIVE_ID = 'home-chat-input';
export const COMPOSER_MIN_HEIGHT = 56;

export type ChatComposerHandle = { focus: () => void };

export type ChatComposerProps = {
  ref?: Ref<ChatComposerHandle>;
  value: string;
  canSend: boolean;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onHeightChange: (height: number) => void;
};
