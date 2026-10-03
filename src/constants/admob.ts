import { Platform } from 'react-native';

export type AdMobFixedBannerSize = '320x50' | '300x250';

type AdMobPlatformUnitIds = {
  ios: string;
  android: string;
};

const ADMOB_FIXED_BANNER_UNIT_IDS: Record<AdMobFixedBannerSize, AdMobPlatformUnitIds> = {
  '320x50': {
    ios: 'ca-app-pub-1854881881447643/4836560138',
    android: 'ca-app-pub-1854881881447643/2401968484',
  },
  '300x250': {
    ios: 'ca-app-pub-1854881881447643/3523478461',
    android: 'ca-app-pub-1854881881447643/8738626213',
  },
};

export function getFixedBannerAdUnitId(size: AdMobFixedBannerSize) {
  if (Platform.OS === 'ios') return ADMOB_FIXED_BANNER_UNIT_IDS[size].ios;
  if (Platform.OS === 'android') return ADMOB_FIXED_BANNER_UNIT_IDS[size].android;
  return ADMOB_FIXED_BANNER_UNIT_IDS[size].android;
}
