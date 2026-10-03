import type { ExpoConfig } from 'expo/config';
import fs from 'fs';
import path from 'path';

const DEFAULT_APP_VERSION = '5.2026.001';
const DEFAULT_APP_BASE_URL = 'https://sendquiz.net';
const ROOT_VIEW_BACKGROUND_COLOR = '#FFFFFF';
const EAS_PROJECT_ID = '3ae1c128-d77a-4bbc-ba89-b1c880a0a793';
const IOS_TRACKING_PERMISSION_DEFAULT =
  '맞춤형 광고와 성과 측정을 위해 다른 앱과 웹사이트의 활동 정보를 사용할 수 있어요.';
const GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_MAVEN_REPOS = [
  'https://android-sdk.is.com/',
  'https://artifact.bytedance.com/repository/pangle/',
] as const;
const GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_DEPENDENCIES = [
  'com.google.ads.mediation:inmobi:11.2.0.0',
  'com.google.ads.mediation:ironsource:9.4.1.0',
  'com.google.ads.mediation:vungle:7.7.2.0',
  'com.google.ads.mediation:facebook:6.21.0.2',
  'com.google.ads.mediation:pangle:8.0.0.4.0',
] as const;
const GOOGLE_MOBILE_ADS_MEDIATION_IOS_PODS = [
  { name: 'GoogleMobileAdsMediationInMobi' },
  { name: 'GoogleMobileAdsMediationIronSource' },
  { name: 'GoogleMobileAdsMediationVungle' },
  { name: 'GoogleMobileAdsMediationFacebook' },
  { name: 'GoogleMobileAdsMediationPangle' },
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

function parseEnvFile(filename: string) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) return {};

  const contents = fs.readFileSync(filePath, 'utf8');
  const parsed: Record<string, string> = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }

    if (key) parsed[key] = value;
  }

  return parsed;
}

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
  return isEasBuild() || process.env.APP_ENV === 'production';
}

function isLocalAdMobEnabled() {
  return process.env.is_admob === '1';
}

function applyExclusiveEnv({ preferredFile, excludeFile }: { preferredFile: string; excludeFile: string }) {
  const excluded = parseEnvFile(excludeFile);
  for (const key of Object.keys(excluded)) {
    delete process.env[key];
  }

  const preferred = parseEnvFile(preferredFile);
  for (const [key, value] of Object.entries(preferred)) {
    process.env[key] = value;
  }
}

if (isProductionBuild()) {
  applyExclusiveEnv({ preferredFile: '.env', excludeFile: '.env.development' });
} else {
  applyExclusiveEnv({ preferredFile: '.env.development', excludeFile: '.env' });
}

export default (): ExpoConfig => {
  const apiBaseUrl = normalizeBaseUrl(process.env.APP_BASE_URL) ?? DEFAULT_APP_BASE_URL;
  const isAdMobEnabled = isProductionBuild() || isLocalAdMobEnabled();
  const easProjectId = normalizeEnv(process.env.EAS_PROJECT_ID) ?? EAS_PROJECT_ID;
  const iosGoogleServicesFile =
    normalizeEnv(process.env.IOS_GOOGLE_SERVICES_FILE) ?? './GoogleService-Info.plist';
  const androidGoogleServicesFile =
    normalizeEnv(process.env.ANDROID_GOOGLE_SERVICES_FILE) ?? './google-services.json';

  return {
    name: 'SEND',
    slug: 'send',
    scheme: 'send',
    version: DEFAULT_APP_VERSION,
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    backgroundColor: ROOT_VIEW_BACKGROUND_COLOR,
    icon: './assets/images/icon.png',
    ios: {
      icon: './assets/images/ios-icon.png',
      backgroundColor: ROOT_VIEW_BACKGROUND_COLOR,
      supportsTablet: false,
      bundleIdentifier: 'com.send.quiz',
      googleServicesFile: iosGoogleServicesFile,
      appleTeamId: 'KTGYAM53PK',
      entitlements: {
        'com.apple.developer.declared-age-range': true,
      },
      infoPlist: {
        CFBundleAllowMixedLocalizations: true,
        UIDesignRequiresCompatibility: true,
        UIViewControllerBasedStatusBarAppearance: true,
      },
      
      config: {
        usesNonExemptEncryption: false,
      },
      
    },
    android: {
      icon: './assets/images/icon.png',
      package: 'com.send.quiz',
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
      '@react-native-firebase/app',
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
            useFrameworks: 'static',
            ccacheEnabled: true,
            forceStaticLinking: ['RNFBApp', 'RNFBAnalytics'],
            extraPods: [
              { name: 'GoogleUtilities', modular_headers: true },
              ...GOOGLE_MOBILE_ADS_MEDIATION_IOS_PODS,
            ],
            privacyManifestAggregationEnabled: true,
          },
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: '36.0.0',
            kotlinVersion: '2.1.20',
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
      isAdMobEnabled,
      eas: {
        projectId: easProjectId,
      },
    },
  };
};
