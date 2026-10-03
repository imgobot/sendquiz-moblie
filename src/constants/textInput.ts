import type { TextInputProps } from 'react-native';

export const TEXT_INPUT_NO_SUGGESTIONS_PROPS: Pick<
  TextInputProps,
  'autoCapitalize' | 'autoComplete' | 'autoCorrect' | 'spellCheck' | 'textContentType'
> = {
  autoCapitalize: 'none',
  autoComplete: 'off',
  autoCorrect: false,
  spellCheck: false,
  textContentType: 'none',
};

export const CHAT_COMPOSER_TEXT_INPUT_PROPS = TEXT_INPUT_NO_SUGGESTIONS_PROPS;
