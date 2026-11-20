import { readUSOptOut } from './usPrivacy';
import { setAdvertiserTrackingEnabled, setDataProcessingOptions } from '@react-native-google-mobile-ads/facebook';
import { requireNativeModule } from 'expo';
import { getTrackingPermissionsAsync } from 'expo-tracking-transparency';
import mobileAds, { AdsConsent, type AdsConsentInfo } from 'react-native-google-mobile-ads';

const mediation = requireNativeModule<{ setUSPrivacy(optedOut: boolean): void }>('MediationPrivacy');
let initialization: ReturnType<ReturnType<typeof mobileAds>['initialize']> | undefined;

export async function applyConsent(info: AdsConsentInfo) {
  const optedOut = readUSOptOut(await AdsConsent.getGppString());
  if (optedOut !== undefined) {
    mediation.setUSPrivacy(optedOut);
    setDataProcessingOptions(optedOut ? ['LDU'] : []);
  }

  if (info.canRequestAds) {
    const { granted } = await getTrackingPermissionsAsync();
    setAdvertiserTrackingEnabled(granted);
    initialization ??= mobileAds().initialize().catch(error => {
      initialization = undefined;
      throw error;
    });
    await initialization;
  }
}

export function gatherConsent() {
  return AdsConsent.gatherConsent().catch(() => AdsConsent.getConsentInfo());
}
