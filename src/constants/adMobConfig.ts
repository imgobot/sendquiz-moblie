import Constants from 'expo-constants';

const rawIsAdMobEnabled = Constants.expoConfig?.extra?.isAdMobEnabled;

export const IS_AD_MOB_ENABLED = rawIsAdMobEnabled === true;
