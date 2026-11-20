import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { useIsFocused } from 'expo-router/react-navigation';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import {
  NativeAdView,
  NativeAdChoicesPlacement,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
  useNativeAd,
} from 'react-native-google-mobile-ads';
import { APP_PALETTE } from '../../constants/palette';
import { useButtonBlue } from '../../contexts/ThemeContext';
import { useAds } from '../../contexts/AdsContext';

export function AdMobNativeAd() {
  const isFocused = useIsFocused();
  const { ready: isReady } = useAds();

  return (
    <View style={styles.card}>
      {isReady && isFocused ? <NativeAdContent /> : null}
    </View>
  );
}

function NativeAdContent() {
  const { t } = useTranslation();
  const buttonBlue = useButtonBlue();
  const adUnitId = Constants.expoConfig?.extra?.nativeAdUnitIds?.[Platform.OS];
  const { nativeAd } = useNativeAd({
    adUnitId: adUnitId ?? (__DEV__ ? TestIds.NATIVE : null),
    requestOptions: { adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT },
  });

  if (!nativeAd) return null;

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.adView}>
      <View style={styles.thumbnail}>
        {nativeAd.icon ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.image} />
          </NativeAsset>
        ) : (
          <NativeMediaView resizeMode="cover" style={styles.image} />
        )}
      </View>
      <View style={styles.metadata}>
        <View style={styles.advertiserRow}>
          <Text style={styles.adLabel}>{t('common.ad')}</Text>
          {nativeAd.advertiser?.trim() ? (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text numberOfLines={1} style={styles.advertiser}>{nativeAd.advertiser}</Text>
            </NativeAsset>
          ) : null}
        </View>
        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <Text numberOfLines={1} style={styles.headline}>{nativeAd.headline}</Text>
        </NativeAsset>
        {nativeAd.body?.trim() ? (
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text numberOfLines={1} style={styles.body}>{nativeAd.body}</Text>
          </NativeAsset>
        ) : null}
      </View>
      {nativeAd.callToAction?.trim() ? (
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Text numberOfLines={1} style={[styles.action, { backgroundColor: buttonBlue }]}>{nativeAd.callToAction}</Text>
        </NativeAsset>
      ) : null}
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 80,
    minWidth: 120,
    borderRadius: 14,
    backgroundColor: '#F3F3F3',
    overflow: 'hidden',
  },
  adView: {
    flex: 1,
    margin: 6,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbnail: { width: 48, height: 48, borderRadius: 10, overflow: 'hidden' },
  image: { width: 48, height: 48, aspectRatio: 1 },
  metadata: { flex: 1, gap: 1 },
  advertiserRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  adLabel: { color: APP_PALETTE.muted, fontSize: 9, fontWeight: '800' },
  advertiser: { flexShrink: 1, color: APP_PALETTE.muted, fontSize: 11, fontWeight: '600' },
  headline: { color: APP_PALETTE.text, fontSize: 14, fontWeight: '700' },
  body: { color: APP_PALETTE.muted, fontSize: 11, fontWeight: '500' },
  action: {
    color: APP_PALETTE.primaryText,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    overflow: 'hidden',
    fontSize: 13,
    fontWeight: '800',
  },
});
