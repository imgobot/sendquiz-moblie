import type { TFunction } from 'i18next';

export const APP_MESSAGES = {
  // =========================
  // Common (alerts/errors)
  // =========================

  // =========================
  // Auth
  // =========================
  AUTH_EMAIL_REQUIRED: { code: 'MOB-AUTH-001', i18nKey: 'auth.emailRequired' },
  AUTH_EMAIL_CHECK_FAILED: { code: 'MOB-AUTH-002', i18nKey: 'auth.emailCheckFailed' },
  AUTH_EMAIL_CONFIRM_NEEDED: { code: 'MOB-AUTH-003', i18nKey: 'auth.emailConfirmNeeded' },
  AUTH_PASSWORD_REQUIRED: { code: 'MOB-AUTH-004', i18nKey: 'auth.passwordRequired' },
  AUTH_LOGIN_INVALID: { code: 'MOB-AUTH-005', i18nKey: 'auth.loginInvalid' },
  AUTH_NICKNAME_REQUIRED: { code: 'MOB-AUTH-006', i18nKey: 'auth.nicknameRequired' },
  AUTH_PASSWORD_MISMATCH: { code: 'MOB-AUTH-007', i18nKey: 'auth.passwordMismatch' },
  AUTH_REGISTER_INVALID: { code: 'MOB-AUTH-008', i18nKey: 'auth.registerInvalid' },
  AUTH_EMAIL_EXISTS_LOGIN: { code: 'MOB-AUTH-009', i18nKey: 'auth.emailExistsLogin' },
  AUTH_CONFIRM_CODE_REQUIRED: { code: 'MOB-AUTH-010', i18nKey: 'auth.confirmCodeRequired' },
  AUTH_CONFIRM_CODE_INVALID: { code: 'MOB-AUTH-011', i18nKey: 'auth.confirmCodeInvalid' },
  AUTH_RESEND_OK: { code: 'MOB-AUTH-012', i18nKey: 'auth.resendOk' },
  AUTH_RESEND_FAILED: { code: 'MOB-AUTH-013', i18nKey: 'auth.resendFailed' },
  AUTH_PASSWORD_CHANGED: { code: 'MOB-AUTH-033', i18nKey: 'auth.passwordChanged' },

  // =========================
  // Feedback
  // =========================
  FEEDBACK_MESSAGE_REQUIRED: { code: 'MOB-FEEDBACK-001', i18nKey: 'feedback.messageRequired' },
  FEEDBACK_SUBMIT_SUCCESS: { code: 'MOB-FEEDBACK-002', i18nKey: 'feedback.submitSuccess' },
  FEEDBACK_SUBMIT_FAILED: { code: 'MOB-FEEDBACK-003', i18nKey: 'feedback.submitFailed' },

  // =========================
  // Profile
  // =========================
  PROFILE_LOAD_FAILED: { code: 'MOB-PROFILE-012', i18nKey: 'profile.loadFailed' },
  PROFILE_NICKNAME_UPDATED: { code: 'MOB-PROFILE-001', i18nKey: 'profile.nicknameUpdated' },
  PROFILE_NICKNAME_UPDATE_FAILED: { code: 'MOB-PROFILE-002', i18nKey: 'profile.nicknameUpdateFailed' },
  PROFILE_DELETE_CONFIRM: { code: 'MOB-PROFILE-003', i18nKey: 'profile.deleteConfirm' },
  PROFILE_DELETE_FAILED: { code: 'MOB-PROFILE-004', i18nKey: 'profile.deleteFailed' },
  PROFILE_PASSWORD_REQUIRED_CURRENT: { code: 'MOB-PROFILE-005', i18nKey: 'profile.passwordRequiredCurrent' },
  PROFILE_PASSWORD_REQUIRED_NEW: { code: 'MOB-PROFILE-006', i18nKey: 'profile.passwordRequiredNew' },
  PROFILE_PASSWORD_UPDATED: { code: 'MOB-PROFILE-007', i18nKey: 'profile.passwordUpdated' },
  PROFILE_PASSWORD_UPDATE_FAILED: { code: 'MOB-PROFILE-008', i18nKey: 'profile.passwordUpdateFailed' },
  PROFILE_WITHDRAW_TITLE: { code: 'MOB-PROFILE-009', i18nKey: 'profile.withdrawTitle' },
  PROFILE_WITHDRAW_CANCEL: { code: 'MOB-PROFILE-010', i18nKey: 'profile.withdrawCancel' },
  PROFILE_WITHDRAW_CONFIRM: { code: 'MOB-PROFILE-011', i18nKey: 'profile.withdrawConfirm' },

  // =========================
  // Quiz
  // =========================
  QUIZ_LOGIN_REQUIRED: { code: 'MOB-QUIZ-001', i18nKey: 'quiz.loginRequired' },
  QUIZ_LOAD_CHATS_FAILED: { code: 'MOB-QUIZ-002', i18nKey: 'quiz.loadChatsFailed' },
  QUIZ_RENAME_CHAT_FAILED: { code: 'MOB-QUIZ-003', i18nKey: 'quiz.renameChatFailed' },
  QUIZ_CREATE_CHAT_FAILED: { code: 'MOB-QUIZ-004', i18nKey: 'quiz.createChatFailed' },
  QUIZ_CREATE_ITEM_FAILED: { code: 'MOB-QUIZ-005', i18nKey: 'quiz.createItemFailed' },
  QUIZ_UPDATE_ITEM_FAILED: { code: 'MOB-QUIZ-006', i18nKey: 'quiz.updateItemFailed' },
  QUIZ_DELETE_ITEM_FAILED: { code: 'MOB-QUIZ-007', i18nKey: 'quiz.deleteItemFailed' },
  QUIZ_DELETE_CHAT_FAILED: { code: 'MOB-QUIZ-008', i18nKey: 'quiz.deleteChatFailed' },
  QUIZ_EMPTY_CHATS: { code: 'MOB-QUIZ-009', i18nKey: 'quiz.emptyChats' },
  QUIZ_DELETE_CHAT_CONFIRM_TITLE: { code: 'MOB-QUIZ-010', i18nKey: 'quiz.deleteChatConfirmTitle' },
  QUIZ_DELETE_CHAT_CONFIRM_BODY: { code: 'MOB-QUIZ-011', i18nKey: 'quiz.deleteChatConfirmBody' },
  QUIZ_DELETE_ITEM_CONFIRM_TITLE: { code: 'MOB-QUIZ-012', i18nKey: 'quiz.deleteItemConfirmTitle' },
  QUIZ_DELETE_ITEM_CONFIRM_BODY: { code: 'MOB-QUIZ-013', i18nKey: 'quiz.deleteItemConfirmBody' },
} as const;

export type AppMessageKey = keyof typeof APP_MESSAGES;

export function msg(t: TFunction, key: AppMessageKey, options?: Record<string, string | number>) {
  return t(APP_MESSAGES[key].i18nKey, options);
}

export function msgCode(key: AppMessageKey) {
  return APP_MESSAGES[key].code;
}
