import type { ExpoConfig } from 'expo/config';

const DEFAULT_APP_VERSION = '11.2026.001';
const DEFAULT_APP_BASE_URL = 'https://sendquiz.imgobot.com';
const ROOT_VIEW_BACKGROUND_COLOR = '#FFFFFF';
const EAS_PROJECT_ID = '3ae1c128-d77a-4bbc-ba89-b1c880a0a793';
const GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_MAVEN_REPOS = [
  'https://artifact.bytedance.com/repository/pangle/',
] as const;
const GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_DEPENDENCIES = [
  'com.google.android.libraries.ads.mobile.sdk:ads-mobile-sdk:1.6.0',
  'com.google.ads.mediation:vungle:7.8.0.0',
  'com.google.ads.mediation:facebook:6.22.0.1',
  'com.google.ads.mediation:pangle:8.4.0.5.0',
] as const;
const GOOGLE_MOBILE_ADS_MEDIATION_IOS_PODS = [
  { name: 'GoogleMobileAdsMediationVungle', version: '7.7.8.0' },
  { name: 'GoogleMobileAdsMediationFacebook', version: '6.22.1.0' },
  { name: 'GoogleMobileAdsMediationPangle', version: '8.4.0.8.0' },
] as const;
const GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_PROGUARD_RULES = `
-keep class com.google.android.gms.internal.consent_sdk.** { *; }
-dontwarn com.iab.omid.**
-keep class com.iab.omid.** { *; }
-keep class com.bytedance.sdk.openadsdk.** {*;}
-keep public interface com.bytedance.sdk.openadsdk.downloadnew.** {*;}
-keep class ms.bd.o.Pgl.**{*;}
-keep class com.bytedance.mobsec.metasec.ov.**{*;}
-keep class com.bykv.vk.openvk.preload.** { *; }
-dontwarn com.bytedance.sdk.openadsdk.core.model.NetExtParams$RenderType
-dontwarn com.bytedance.sdk.openadsdk.core.settings.TTSdkSettings$FETCH_REQUEST_SOURCE
-keepattributes JavascriptInterface
-keepclassmembers class * {
  @android.webkit.JavascriptInterface <methods>;
}
`;

function normalizeEnv(value?: string) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeBaseUrl(value?: string) {
  const normalized = normalizeEnv(value);
  if (!normalized) return undefined;
  return normalized.replace(/\/+$/, '');
}

function isEasBuild() {
  return !!process.env.EAS_BUILD;
}

function isProductionBuild() {
  if (process.env.APP_ENV) return process.env.APP_ENV === 'production';
  if (process.env.EAS_BUILD_PROFILE === 'development') return false;
  return isEasBuild();
}

export default (): ExpoConfig => {
  const isProduction = isProductionBuild();
  const appIdentifier = isProduction ? 'com.send.quiz' : 'com.send.quiz.dev';
  const apiBaseUrl = normalizeBaseUrl(process.env.APP_BASE_URL) ?? DEFAULT_APP_BASE_URL;
  const easProjectId = normalizeEnv(process.env.EAS_PROJECT_ID) ?? EAS_PROJECT_ID;
  const iosGoogleServicesFile =
    normalizeEnv(process.env.IOS_GOOGLE_SERVICES_FILE) ??
    (isProduction ? './GoogleService-Info.plist' : undefined);
  const androidGoogleServicesFile =
    normalizeEnv(process.env.ANDROID_GOOGLE_SERVICES_FILE) ??
    (isProduction ? './google-services.json' : undefined);

  return {
    name: isProduction ? 'send' : 'send(dev)',
    slug: 'send',
    scheme: isProduction ? 'send' : 'send-dev',
    version: DEFAULT_APP_VERSION,
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    backgroundColor: ROOT_VIEW_BACKGROUND_COLOR,
    icon: './assets/images/icon.png',
    ios: {
      icon: './assets/Send.icon',
      backgroundColor: ROOT_VIEW_BACKGROUND_COLOR,
      supportsTablet: false,
      bundleIdentifier: appIdentifier,
      googleServicesFile: iosGoogleServicesFile,
      appleTeamId: 'KTGYAM53PK',
      entitlements: isProduction
        ? { 'com.apple.developer.declared-age-range': true }
        : {},
      infoPlist: {
        CFBundleAllowMixedLocalizations: true,
        UIViewControllerBasedStatusBarAppearance: true,
      },
      
      config: {
        usesNonExemptEncryption: false,
      },
      
    },
    android: {
      package: appIdentifier,
      userInterfaceStyle: 'automatic',
      googleServicesFile: androidGoogleServicesFile,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon-foreground.png',
        backgroundColor: '#FFFFFF',
        monochromeImage: './assets/images/adaptive-icon-monochrome.png',
      },
    },
    plugins: [
      'expo-router',
      'expo-web-browser',
      'expo-system-ui',
      'expo-status-bar',
      './plugins/withAndroidLargeScreenSupport',
      'expo-font',
      ...(iosGoogleServicesFile || androidGoogleServicesFile ? ['@react-native-firebase/app'] : []),
      [
        'expo-localization',
        {
          supportedLocales: {
            ios: ['ko', 'en', 'ja', 'zh', 'hi', 'pt-BR', 'id', 'es', 'tr', 'de'],
            android: ['ko', 'en', 'ja', 'zh', 'hi', 'pt-BR', 'id', 'es', 'tr', 'de'],
          },
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'dynamic',
            ccacheEnabled: true,
            extraPods: [
              ...GOOGLE_MOBILE_ADS_MEDIATION_IOS_PODS,
            ],
            privacyManifestAggregationEnabled: true,
          },
          android: {
            kotlinVersion: '2.4.0',
            extraMavenRepos: GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_MAVEN_REPOS,
            extraProguardRules: GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_PROGUARD_RULES,
          },
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: 'ca-app-pub-1854881881447643~4497885180',
          iosAppId: 'ca-app-pub-1854881881447643~2115920960',
          androidSdk: 'nextgen',
          delayAppMeasurementInit: true,
          optimizeInitialization: true,
          optimizeAdLoading: true,
          userTrackingUsageDescription: '맞춤형 광고 및 앱 품질 개선을 위해 기기 식별자(IDFA)를 사용할 수 있습니다. 허용하지 않아도 앱 이용이 가능합니다.',
        },
      ],
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission:
            '맞춤형 광고 및 앱 품질 개선을 위해 기기 식별자(IDFA)를 사용할 수 있습니다. 허용하지 않아도 앱 이용이 가능합니다.',
        },
      ],
      [
        './plugins/withGoogleMobileAdsMediation.ts',
        {
          androidDependencies: GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_DEPENDENCIES,
        },
      ],
    ],
    locales: {
      en: './locales/app-metadata/en.json',
      ko: './locales/app-metadata/ko.json',
      ja: './locales/app-metadata/ja.json',
      zh: './locales/app-metadata/zh.json',
      hi: './locales/app-metadata/hi.json',
      'pt-BR': './locales/app-metadata/pt-BR.json',
      id: './locales/app-metadata/id.json',
      es: './locales/app-metadata/es.json',
      tr: './locales/app-metadata/tr.json',
      de: './locales/app-metadata/de.json',
    },
    extra: {
      apiBaseUrl,
      eas: {
        projectId: easProjectId,
      },
    },
  };
};
