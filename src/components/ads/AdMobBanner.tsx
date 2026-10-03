import { useEffect, useState } from 'react';
import { useIsFocused } from "expo-router/react-navigation";
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { IS_AD_MOB_ENABLED } from '../../constants/adMobConfig';
import { getFixedBannerAdUnitId, type AdMobFixedBannerSize } from '../../constants/admob';
import { useAdMobReady } from '../../utils/adMobReady';

const BANNER_MOUNT_IDLE_TIMEOUT_MS = 500;

type AdMobBannerProps = {
  size: AdMobFixedBannerSize;
};

type IdleCallbackGlobals = typeof globalThis & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  banner320x50: {
    minHeight: 50,
    width: 320,
  },
  banner300x250: {
    minHeight: 250,
    width: 300,
  },
});

const AD_MOB_BANNER_CONFIG = {
  '320x50': {
    adSize: BannerAdSize.BANNER,
    style: styles.banner320x50,
  },
  '300x250': {
    adSize: BannerAdSize.MEDIUM_RECTANGLE,
    style: styles.banner300x250,
  },
} as const;

function scheduleBannerMount(callback: () => void) {
  const idleGlobals = globalThis as IdleCallbackGlobals;

  if (typeof idleGlobals.requestIdleCallback === 'function') {
    const idleHandle = idleGlobals.requestIdleCallback(callback, { timeout: BANNER_MOUNT_IDLE_TIMEOUT_MS });
    return () => idleGlobals.cancelIdleCallback?.(idleHandle);
  }

  const timeoutHandle = setTimeout(callback, BANNER_MOUNT_IDLE_TIMEOUT_MS);
  return () => clearTimeout(timeoutHandle);
}

function useShouldMountBannerAd(size: AdMobFixedBannerSize) {
  const isFocused = useIsFocused();
  const isAdMobReady = useAdMobReady();
  const [didFinishInteractions, setDidFinishInteractions] = useState(size !== '300x250');

  useEffect(() => {
    if (size !== '300x250') {
      setDidFinishInteractions(true);
      return;
    }

    if (!isFocused) {
      setDidFinishInteractions(false);
      return;
    }

    setDidFinishInteractions(false);
    const cancelBannerMount = scheduleBannerMount(() => {
      setDidFinishInteractions(true);
    });

    return cancelBannerMount;
  }, [isFocused, size]);

  return (
    isFocused &&
    isAdMobReady &&
    didFinishInteractions &&
    (Platform.OS === 'ios' || Platform.OS === 'android')
  );
}

function AdMobBanner({ size }: AdMobBannerProps) {
  const shouldMountBannerAd = useShouldMountBannerAd(size);
  const config = AD_MOB_BANNER_CONFIG[size];

  if (!IS_AD_MOB_ENABLED) return null;

  return (
    <View style={[styles.container, config.style]}>
      {shouldMountBannerAd ? (
        <BannerAd
          unitId={getFixedBannerAdUnitId(size)}
          size={config.adSize}
        />
      ) : null}
    </View>
  );
}

export function AdMobBanner320x50() {
  return <AdMobBanner size="320x50" />;
}

export function AdMobBanner300x250() {
  return <AdMobBanner size="300x250" />;
}
