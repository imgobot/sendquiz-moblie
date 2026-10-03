const META_TRACKING_HELPER_BLOCK = `  // @generated begin google-mobile-ads-mediation-meta-tracking-helper
  private func syncMetaAudienceNetworkTracking() {
    if #available(iOS 17, *) {
      return
    }

    if #available(iOS 14, *) {
      FBAdSettings.setAdvertiserTrackingEnabled(ATTrackingManager.trackingAuthorizationStatus == .authorized)
      return
    }

    FBAdSettings.setAdvertiserTrackingEnabled(true)
  }
  // @generated end google-mobile-ads-mediation-meta-tracking-helper
`;

const META_TRACKING_DID_FINISH_BLOCK = `    // @generated begin google-mobile-ads-mediation-meta-tracking-did-finish
    syncMetaAudienceNetworkTracking()
    // @generated end google-mobile-ads-mediation-meta-tracking-did-finish
`;

const META_TRACKING_DID_BECOME_ACTIVE_BLOCK = `  // @generated begin google-mobile-ads-mediation-meta-tracking-did-become-active
  public override func applicationDidBecomeActive(_ application: UIApplication) {
    syncMetaAudienceNetworkTracking()
    super.applicationDidBecomeActive(application)
  }
  // @generated end google-mobile-ads-mediation-meta-tracking-did-become-active
`;

function ensureImport(contents: string, importName: string): string {
  if (contents.includes(`import ${importName}`)) {
    return contents;
  }

  const importLines = contents.match(/^import .*$/gm);
  if (!importLines || importLines.length === 0) {
    return `import ${importName}\n${contents}`;
  }

  const lastImport = importLines[importLines.length - 1];
  return contents.replace(lastImport, `${lastImport}\nimport ${importName}`);
}

export function syncMetaAudienceNetworkTracking(contents: string): string {
  let nextContents = contents
    .replace(
      /\n  \/\/ @generated begin google-mobile-ads-mediation-meta-tracking-helper[\s\S]*?  \/\/ @generated end google-mobile-ads-mediation-meta-tracking-helper\n/g,
      '\n',
    )
    .replace(
      /\n  private func syncMetaAudienceNetworkTracking\(\) \{[\s\S]*?\n  }\n/g,
      '\n',
    )
    .replace(/\n{3,}/g, '\n\n');

  nextContents = ensureImport(nextContents, 'FBAudienceNetwork');
  nextContents = ensureImport(nextContents, 'AppTrackingTransparency');
  nextContents = nextContents.replace(
    /(@main\nclass AppDelegate: ExpoAppDelegate \{\n)/,
    `$1${META_TRACKING_HELPER_BLOCK}`,
  );

  nextContents = nextContents.replace(
    /\n\s*\/\/ @generated begin google-mobile-ads-mediation-meta-tracking-did-finish[\s\S]*?\/\/ @generated end google-mobile-ads-mediation-meta-tracking-did-finish\n/g,
    '\n',
  );
  nextContents = nextContents.replace(/\n\s*syncMetaAudienceNetworkTracking\(\)\s*\n/g, '\n');
  nextContents = nextContents.replace(
    /(\n\s*return super\.application\(application, didFinishLaunchingWithOptions: launchOptions\)\n)/,
    `\n${META_TRACKING_DID_FINISH_BLOCK}$1`,
  );

  nextContents = nextContents
    .replace(
      /\n  \/\/ @generated begin google-mobile-ads-mediation-meta-tracking-did-become-active[\s\S]*?  \/\/ @generated end google-mobile-ads-mediation-meta-tracking-did-become-active\n/g,
      '\n',
    )
    .replace(/(\n  \/\/ Linking API\n)/, `\n${META_TRACKING_DID_BECOME_ACTIVE_BLOCK}$1`);

  return nextContents.replace(/\n{3,}/g, '\n\n');
}
