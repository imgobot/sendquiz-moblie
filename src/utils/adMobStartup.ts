import { NativeModules } from 'react-native';
import mobileAds, {
  AdsConsent,
  AdsConsentStatus,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';
import { IS_AD_MOB_ENABLED } from '../constants/adMobConfig';
import { setAdMobReady } from './adMobReady';
import { requestTrackingPermissionIfNeeded } from './trackingTransparency';

type MediationPrivacyModule = {
  sync(allowsPersonalizedAds: boolean): void;
};

const { MediationPrivacyModule } = NativeModules as {
  MediationPrivacyModule: MediationPrivacyModule;
};

let adMobStartupStarted = false;

async function gatherConsentInfo() {
  try {
    return await AdsConsent.gatherConsent();
  } catch (error) {
    console.warn('ADMOB_CONSENT_GATHER_FAILED', error);
    return AdsConsent.getConsentInfo();
  }
}

async function syncMediationPrivacy() {
  const consentInfo = await AdsConsent.getConsentInfo();
  if (consentInfo.status === AdsConsentStatus.NOT_REQUIRED) {
    MediationPrivacyModule.sync(true);
    return;
  }

  const choices = await AdsConsent.getUserChoices();
  MediationPrivacyModule.sync(
    choices.storeAndAccessInformationOnDevice && choices.selectPersonalisedAds,
  );
}

export async function startAdMobIfNeeded() {
  if (adMobStartupStarted) return;
  adMobStartupStarted = true;

  if (!IS_AD_MOB_ENABLED) {
    setAdMobReady(false);
    return;
  }

  const { canRequestAds } = await gatherConsentInfo();
  if (!canRequestAds) {
    setAdMobReady(false);
    return;
  }

  await requestTrackingPermissionIfNeeded();
  await syncMediationPrivacy();
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.MA,
  });
  await mobileAds().initialize();
  setAdMobReady(true);
}
