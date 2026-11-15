import { describe, expect, it } from 'vitest';
import { syncMetaAudienceNetworkTracking } from './syncMetaAudienceNetworkTracking';

describe('syncMetaAudienceNetworkTracking', () => {
  it.each(['ExpoAppDelegate', 'ExpoAppDelegate, ExpoReactNativeFactoryProvider'])(
    'defines the tracking helper for %s and remains idempotent',
    (superclass) => {
      const source = `internal import Expo
import React

@main
class AppDelegate: ${superclass} {
  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
`;
      const result = syncMetaAudienceNetworkTracking(source);

      expect(result).toContain('private func syncMetaAudienceNetworkTracking()');
      expect(result).toContain('    syncMetaAudienceNetworkTracking()');
      expect(result).toContain('import FBAudienceNetwork');
      expect(result).toContain('import AppTrackingTransparency');
      expect(syncMetaAudienceNetworkTracking(result)).toBe(result);
    },
  );
});
