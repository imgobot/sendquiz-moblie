const {
  AndroidConfig,
  createRunOncePlugin,
  withAndroidManifest,
} = require("expo/config-plugins");

// Android 16 (targetSdk 36) warns that large-screen form factors can ignore
// orientation/resizeability restrictions. Keep the iOS orientation locked via
// `orientation: "portrait"` but remove Android manifest restrictions so the app
// can properly adapt on tablets/foldables and in multi-window.
const TARGET_ACTIVITY_NAMES = new Set([
  "com.send.quiz.MainActivity",
  "com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity",
]);

const ACTIVITY_ATTRS_TO_REMOVE = [
  "android:screenOrientation",
  "android:resizeableActivity",
  "android:maxAspectRatio",
  "android:minAspectRatio",
];

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function removeAttrsIfTarget(activity) {
  if (!activity || !activity.$) return;

  const name = activity.$["android:name"];
  if (!TARGET_ACTIVITY_NAMES.has(name)) return;

  for (const attr of ACTIVITY_ATTRS_TO_REMOVE) {
    if (attr in activity.$) delete activity.$[attr];
  }
}

const withAndroidLargeScreenSupport = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    // Remove application-level resizeability restriction if present.
    if (mainApplication.$ && mainApplication.$["android:resizeableActivity"]) {
      delete mainApplication.$["android:resizeableActivity"];
    }

    const activities = toArray(mainApplication.activity);
    for (const activity of activities) removeAttrsIfTarget(activity);

    const activityAliases = toArray(mainApplication["activity-alias"]);
    for (const alias of activityAliases) removeAttrsIfTarget(alias);

    return config;
  });
};

module.exports = createRunOncePlugin(
  withAndroidLargeScreenSupport,
  "with-android-large-screen-support",
  "1.0.0",
);

