type ConfigPlugin = import('expo/config-plugins').ConfigPlugin;
type ExpoConfig = import('expo/config').ExpoConfig;

const fs = require('node:fs') as typeof import('node:fs');
const path = require('node:path') as typeof import('node:path');
const {
  createRunOncePlugin,
  withAppBuildGradle,
  withAndroidManifest,
  withDangerousMod,
  withGradleProperties,
  withInfoPlist,
  withPodfile,
  withXcodeProject,
} = require('expo/config-plugins') as typeof import('expo/config-plugins');
const pkg = require('../package.json') as { version: string };
const {
  syncMetaAudienceNetworkTracking,
} = require('./syncMetaAudienceNetworkTracking.ts') as typeof import('./syncMetaAudienceNetworkTracking');
const {
  buildAndroidMediationPrivacyModuleSource,
  buildAndroidMediationPrivacyPackageSource,
  findFile,
  IOS_MEDIATION_PRIVACY_MODULE_FILENAME,
  IOS_MEDIATION_PRIVACY_MODULE_SOURCE,
  syncAndroidMainApplication,
} = require('./googleMobileAdsMediationNativePrivacy.ts') as typeof import('./googleMobileAdsMediationNativePrivacy');

type GoogleMobileAdsMediationPluginOptions = {
  androidDependencies: readonly string[];
};

const GOOGLE_MOBILE_ADS_MEDIATION_GRADLE_PROPERTIES = [
  { key: 'android.useAndroidX', value: 'true' },
  { key: 'android.enableJetifier', value: 'true' },
] as const;
const GOOGLE_MOBILE_ADS_MEDIATION_XCCONFIG_EXCLUDED_ARCHS =
  'arm64e armv7 armv7s i386';
const GOOGLE_MOBILE_ADS_MEDIATION_XCCONFIG_PODS = [
  'FBAudienceNetwork',
  'IronSourceAdQualitySDK',
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

const IOS_MEDIATION_PODFILE_BLOCK_START =
  '# @generated begin google-mobile-ads-mediation';
const IOS_MEDIATION_PODFILE_BLOCK_END =
  '# @generated end google-mobile-ads-mediation';
const IOS_MEDIATION_TARGET_PODFILE_BLOCK_START =
  '# @generated begin google-mobile-ads-mediation-pods';
const IOS_MEDIATION_TARGET_PODFILE_BLOCK_END =
  '# @generated end google-mobile-ads-mediation-pods';
const IOS_GOOGLE_MOBILE_ADS_SDK_VERSION = '13.4.0';
const IOS_MEDIATION_PODFILE_BLOCK = `${IOS_MEDIATION_PODFILE_BLOCK_START}
$RNGoogleMobileAdsSDKVersion = '${IOS_GOOGLE_MOBILE_ADS_SDK_VERSION}'

GOOGLE_MOBILE_ADS_MEDIATION_EXCLUDED_ARCHS = '${GOOGLE_MOBILE_ADS_MEDIATION_XCCONFIG_EXCLUDED_ARCHS}'.freeze
GOOGLE_MOBILE_ADS_MEDIATION_EXCLUDED_ARCHS_PODS = %w[
${GOOGLE_MOBILE_ADS_MEDIATION_XCCONFIG_PODS.map((pod) => `  ${pod}`).join('\n')}
].freeze

pre_integrate do |installer|
  installer.pod_targets.each do |pod_target|
    next unless GOOGLE_MOBILE_ADS_MEDIATION_EXCLUDED_ARCHS_PODS.include?(pod_target.pod_name)

    pod_target.spec_consumers.each do |spec_consumer|
      spec = spec_consumer.spec
      user_target_xcconfig = (spec.attributes_hash['user_target_xcconfig'] || {}).dup
      pod_target_xcconfig = (spec.attributes_hash['pod_target_xcconfig'] || {}).dup

      user_target_xcconfig['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = GOOGLE_MOBILE_ADS_MEDIATION_EXCLUDED_ARCHS
      pod_target_xcconfig['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = GOOGLE_MOBILE_ADS_MEDIATION_EXCLUDED_ARCHS

      spec.attributes_hash['user_target_xcconfig'] = user_target_xcconfig
      spec.attributes_hash['pod_target_xcconfig'] = pod_target_xcconfig
    end
  end
end
${IOS_MEDIATION_PODFILE_BLOCK_END}`;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function syncIosMediationPodfileBlock(contents: string): string {
  const topLevelBlockPattern = new RegExp(
    `${escapeRegExp(IOS_MEDIATION_PODFILE_BLOCK_START)}[\\s\\S]*?${escapeRegExp(IOS_MEDIATION_PODFILE_BLOCK_END)}\\n?`,
    'g',
  );
  const targetBlockPattern = new RegExp(
    `${escapeRegExp(IOS_MEDIATION_TARGET_PODFILE_BLOCK_START)}[\\s\\S]*?${escapeRegExp(IOS_MEDIATION_TARGET_PODFILE_BLOCK_END)}\\n?`,
    'g',
  );
  const nextContents = contents
    .replace(topLevelBlockPattern, '')
    .replace(targetBlockPattern, '');

  if (!nextContents.includes('prepare_react_native_project!')) {
    throw new Error('Unable to find prepare_react_native_project! in ios/Podfile');
  }

  return nextContents.replace(
    'prepare_react_native_project!',
    `prepare_react_native_project!\n\n${IOS_MEDIATION_PODFILE_BLOCK}`,
  );
}

function syncAndroidDependencies(contents: string, dependencies: readonly string[]): string {
  const nextContents = contents.replace(
    /^.*com\.google\.ads\.mediation:(?:inmobi|ironsource|vungle|facebook|pangle):.*\n?/gm,
    '',
  );

  return nextContents
    .replace(
      /dependencies\s*\{/,
      `dependencies {\n${dependencies.map((dependency) => `    implementation "${dependency}"`).join('\n')}`,
    )
    .replace(/\n{3,}/g, '\n\n');
}

function syncIosSkAdNetworkItems(items: unknown): { SKAdNetworkIdentifier: string }[] {
  const existingItems = Array.isArray(items)
    ? items
        .filter(
          (item): item is { SKAdNetworkIdentifier: string } =>
            typeof item === 'object' &&
            item !== null &&
            'SKAdNetworkIdentifier' in item &&
            typeof item.SKAdNetworkIdentifier === 'string',
        )
        .map((item) => item.SKAdNetworkIdentifier)
    : [];

  return [...new Set([...existingItems, ...GOOGLE_MOBILE_ADS_MEDIATION_SK_AD_NETWORK_IDS])].map(
    (identifier) => ({ SKAdNetworkIdentifier: identifier }),
  );
}

const withGoogleMobileAdsMediationAndroidDependencies = (
  config: ExpoConfig,
  androidDependencies: readonly string[],
) =>
  withAppBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents = syncAndroidDependencies(
      modConfig.modResults.contents,
      androidDependencies,
    );
    return modConfig;
  });

const withGoogleMobileAdsMediationGradleProperties: ConfigPlugin = (config) =>
  withGradleProperties(config, (modConfig) => {
    modConfig.modResults = modConfig.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'android.extraMavenRepos'),
    );

    GOOGLE_MOBILE_ADS_MEDIATION_GRADLE_PROPERTIES.forEach(({ key, value }) => {
      const propertyIndex = modConfig.modResults.findIndex(
        (item) => item.type === 'property' && item.key === key,
      );

      if (propertyIndex >= 0) {
        modConfig.modResults[propertyIndex] = { type: 'property', key, value };
        return;
      }

      modConfig.modResults.push({ type: 'property', key, value });
    });

    return modConfig;
  });

const withGoogleMobileAdsMediationAndroidManifest: ConfigPlugin = (config) =>
  withAndroidManifest(config, (modConfig) => {
    modConfig.modResults.manifest.application![0]!.$['android:usesCleartextTraffic'] = 'true';
    return modConfig;
  });

const withGoogleMobileAdsMediationAndroidNativeModule: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const mainApplicationPath = findFile(
        path.join(modConfig.modRequest.projectRoot, 'android', 'app', 'src', 'main'),
        'MainApplication.kt',
      );
      const originalMainApplication = fs.readFileSync(mainApplicationPath, 'utf-8');
      const updatedMainApplication = syncAndroidMainApplication(originalMainApplication);
      const packageMatch = updatedMainApplication.match(/^package\s+([^\n]+)$/m);

      if (!packageMatch) {
        throw new Error(`Unable to resolve package name from ${mainApplicationPath}`);
      }
      const packageName = packageMatch[1];

      if (updatedMainApplication !== originalMainApplication) {
        fs.writeFileSync(mainApplicationPath, updatedMainApplication);
      }

      const sourceDir = path.dirname(mainApplicationPath);
      fs.writeFileSync(
        path.join(sourceDir, 'MediationPrivacyModule.kt'),
        buildAndroidMediationPrivacyModuleSource(packageName),
      );
      fs.writeFileSync(
        path.join(sourceDir, 'MediationPrivacyPackage.kt'),
        buildAndroidMediationPrivacyPackageSource(packageName),
      );
      return modConfig;
    },
  ]);

const withGoogleMobileAdsMediationIosPodfilePatch: ConfigPlugin = (config) =>
  withPodfile(config, (modConfig) => {
    modConfig.modResults.contents = syncIosMediationPodfileBlock(modConfig.modResults.contents);
    return modConfig;
  });

const withGoogleMobileAdsMediationIosInfoPlist: ConfigPlugin = (config) =>
  withInfoPlist(config, (modConfig) => {
    modConfig.modResults.SKAdNetworkItems = syncIosSkAdNetworkItems(
      modConfig.modResults.SKAdNetworkItems,
    );
    return modConfig;
  });

const withGoogleMobileAdsMediationMetaTracking: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      fs.writeFileSync(
        path.join(
          modConfig.modRequest.platformProjectRoot,
          modConfig.modRequest.projectName as string,
          IOS_MEDIATION_PRIVACY_MODULE_FILENAME,
        ),
        IOS_MEDIATION_PRIVACY_MODULE_SOURCE,
      );
      const appDelegatePath = path.join(
        modConfig.modRequest.platformProjectRoot,
        modConfig.modRequest.projectName as string,
        'AppDelegate.swift',
      );
      const original = fs.readFileSync(appDelegatePath, 'utf-8');
      const updated = syncMetaAudienceNetworkTracking(original);

      if (updated !== original) {
        fs.writeFileSync(appDelegatePath, updated);
      }

      return modConfig;
    },
  ]);

const withGoogleMobileAdsMediationIosNativeModuleProject: ConfigPlugin = (config) =>
  withXcodeProject(config, (modConfig) => {
    const filePath = `${modConfig.modRequest.projectName}/${IOS_MEDIATION_PRIVACY_MODULE_FILENAME}`;
    const groupKey = modConfig.modResults.findPBXGroupKey({
      name: modConfig.modRequest.projectName,
    });

    if (!modConfig.modResults.hasFile(filePath)) {
      modConfig.modResults.addSourceFile(filePath, {}, groupKey);
    }
    return modConfig;
  });

const withGoogleMobileAdsMediation = (
  config: ExpoConfig,
  options: GoogleMobileAdsMediationPluginOptions,
): ExpoConfig => {
  config = withGoogleMobileAdsMediationAndroidDependencies(config, options.androidDependencies);
  config = withGoogleMobileAdsMediationGradleProperties(config);
  config = withGoogleMobileAdsMediationAndroidManifest(config);
  config = withGoogleMobileAdsMediationAndroidNativeModule(config);
  config = withGoogleMobileAdsMediationIosPodfilePatch(config);
  config = withGoogleMobileAdsMediationIosInfoPlist(config);
  config = withGoogleMobileAdsMediationMetaTracking(config);
  config = withGoogleMobileAdsMediationIosNativeModuleProject(config);
  return config;
};

module.exports = createRunOncePlugin(
  withGoogleMobileAdsMediation,
  'with-google-mobile-ads-mediation',
  pkg.version,
);
