import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';
import type { ExpoConfig } from 'expo/config';

const DEFAULT_APP_VERSION = '11.2026.001';
const DEFAULT_APP_BASE_URL = 'https://sendquiz.imgobot.com';
const ROOT_VIEW_BACKGROUND_COLOR = '#FFFFFF';
const EAS_PROJECT_ID = '3ae1c128-d77a-4bbc-ba89-b1c880a0a793';
const GOOGLE_MOBILE_ADS_MEDIATION_ANDROID_MAVEN_REPOS = [
  'https://artifact.bytedance.com/repository/pangle/',
] as const;
const GOOGLE_MOBILE_ADS_MEDIATION_SK_AD_NETWORK_IDS = [
  '238da6jt44.skadnetwork',
  'x2jnk7ly8j.skadnetwork',
  'f7s53z58qe.skadnetwork',
  'cstr6suwn9.skadnetwork',
  '4fzdc2evr5.skadnetwork',
  '2fnua5tdw4.skadnetwork',
  'ydx93a7ass.skadnetwork',
  'p78axxw29g.skadnetwork',
  'v72qych5uu.skadnetwork',
  'ludvb6z3bs.skadnetwork',
  'cp8zw746q7.skadnetwork',
  '3sh42y64q3.skadnetwork',
  'c6k4g5qg8m.skadnetwork',
  's39g8k73mm.skadnetwork',
  '3qy4746246.skadnetwork',
  'f38h382jlk.skadnetwork',
  'hs6bdukanm.skadnetwork',
  'mlmmfzh3r3.skadnetwork',
  'wg4vff78zm.skadnetwork',
  'v4nxqhlyqp.skadnetwork',
  'wzmmz9fp6w.skadnetwork',
  'su67r6k2v3.skadnetwork',
  'yclnxrl5pm.skadnetwork',
  't38b2kh725.skadnetwork',
  '7ug5zh24hu.skadnetwork',
  'gta9lk7p23.skadnetwork',
  'vutu7akeur.skadnetwork',
  'y5ghdn5j9k.skadnetwork',
  'v9wttpbfk9.skadnetwork',
  'n38lu8286q.skadnetwork',
  '47vhws6wlr.skadnetwork',
  'kbd757ywx3.skadnetwork',
  '9t245vhmpl.skadnetwork',
  'a2p9lx4jpn.skadnetwork',
  '22mmun2rn5.skadnetwork',
  '44jx6755aq.skadnetwork',
  'k674qkevps.skadnetwork',
  '4468km3ulz.skadnetwork',
  '2u9pt9hc89.skadnetwork',
  '8s468mfl3y.skadnetwork',
  'klf5c3l5u5.skadnetwork',
  'ppxm28t8ap.skadnetwork',
  'kbmxgpxpgc.skadnetwork',
  'uw77j35x4d.skadnetwork',
  '578prtvx9j.skadnetwork',
  '4dzt52r2t5.skadnetwork',
  'tl55sbb4fm.skadnetwork',
  'c3frkrj4fj.skadnetwork',
  'e5fvkxwrpn.skadnetwork',
  '8c4e2ghe7u.skadnetwork',
  '3rd42ekr43.skadnetwork',
  '97r2b46745.skadnetwork',
  '3qcr597p9d.skadnetwork',
  'prcb7njmu6.skadnetwork',
  '5tjdwbrq8w.skadnetwork',
  'm8dbw4sv7c.skadnetwork',
  '424m5254lk.skadnetwork',
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
  const envFile = join(__dirname, isProduction ? '.env.production' : '.env.local');
  const env = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {};
  const apiBaseUrl = normalizeBaseUrl(env.APP_BASE_URL) ?? DEFAULT_APP_BASE_URL;
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
            privacyManifestAggregationEnabled: true,
          },
          android: {
            kotlinVersion: '2.4.0',
            usesCleartextTraffic: true,
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
          skAdNetworkItems: GOOGLE_MOBILE_ADS_MEDIATION_SK_AD_NETWORK_IDS,
        },
      ],
      [
        'expo-tracking-transparency',
        {
          userTrackingPermission:
            '맞춤형 광고 및 앱 품질 개선을 위해 기기 식별자(IDFA)를 사용할 수 있습니다. 허용하지 않아도 앱 이용이 가능합니다.',
        },
      ],
      './plugins/withMediationPodfile.ts',
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
      nativeAdUnitIds: {
        ios: env.EXPO_PUBLIC_ADMOB_NATIVE_IOS_ID,
        android: env.EXPO_PUBLIC_ADMOB_NATIVE_ANDROID_ID,
      },
      eas: {
        projectId: easProjectId,
      },
    },
  };
};
