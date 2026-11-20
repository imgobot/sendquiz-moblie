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
import { useAdMobReady } from '../../utils/adMobReady';

export function AdMobNativeAd() {
  const isFocused = useIsFocused();
  const isReady = useAdMobReady();


  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;

  return (
    <View style={styles.card}>
      {isReady && isFocused ? <NativeAdContent /> : null}
    </View>
  );
}

function NativeAdContent() {
  // Use Google's native video test unit until production units are provided.
  const { nativeAd } = useNativeAd({
    adUnitId: TestIds.NATIVE_VIDEO,
    requestOptions: { adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT },
  });

  if (!nativeAd) return null;

  return (
    <View style={styles.loadedAd}>
      <NativeAdView
        nativeAd={nativeAd}
        style={styles.adView}
      >
        <NativeMediaView resizeMode="cover" style={styles.media} />
        <View pointerEvents="none" style={styles.attribution}>
          <Text style={styles.adLabel}>AD</Text>
        </View>
        <View
          pointerEvents="box-none"
          style={styles.overlay}
        >
          <View style={styles.metadata}>
            {nativeAd.advertiser ? (
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.advertiser}>{nativeAd.advertiser}</Text>
              </NativeAsset>
            ) : null}
            <View style={styles.heading}>
              {nativeAd.icon ? (
                <NativeAsset assetType={NativeAssetType.ICON}>
                  <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
                </NativeAsset>
              ) : null}
              <NativeAsset assetType={NativeAssetType.HEADLINE}>
                <Text style={styles.headline} numberOfLines={1} ellipsizeMode="tail">{nativeAd.headline}</Text>
              </NativeAsset>
            </View>
            {nativeAd.body ? (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text style={styles.body} numberOfLines={1} ellipsizeMode="tail">{nativeAd.body}</Text>
              </NativeAsset>
            ) : null}
          </View>
          {nativeAd.callToAction ? (
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <Text style={styles.action}>더보기</Text>
            </NativeAsset>
          ) : null}
        </View>
      </NativeAdView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 200,
    minWidth: 120,
    borderRadius: 14,
    backgroundColor: '#F3F3F3',
    overflow: 'hidden',
  },
  loadedAd: { flex: 1 },
  // Keep the SDK's corner badge inside the rounded clipping area.
  adView: { flex: 1, marginTop: 6, marginHorizontal: 6 },
  // Override the SDK's default aspect ratio: the parent sizes this full-bleed media view.
  media: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', aspectRatio: undefined },
  attribution: { position: 'absolute', top: 8, left: 8 },
  adLabel: { color: '#FFFFFF', backgroundColor: 'rgba(0, 0, 0, 0.55)', fontSize: 12,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, gap: 12,
    flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.72)' },
  metadata: { flex: 1, gap: 2 },
  advertiser: { color: '#FFFFFF', fontSize: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 15, height: 15, borderRadius: 3 },
  headline: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  body: { color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
  action: { maxWidth: '35%', color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, fontSize: 14, fontWeight: '600' },
});
