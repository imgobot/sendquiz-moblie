import { useIsFocused } from 'expo-router/react-navigation';
import { useTranslation } from 'react-i18next';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import {
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
  useNativeAd,
} from 'react-native-google-mobile-ads';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdMobReady } from '../../utils/adMobReady';

type AdMobNativeAdProps = { compact?: boolean };

export function AdMobNativeAd(props: AdMobNativeAdProps) {
  const isFocused = useIsFocused();
  const isReady = useAdMobReady();

  if (!isReady || !isFocused ||
    (Platform.OS !== 'ios' && Platform.OS !== 'android')) return null;

  return <NativeAdContent {...props} />;
}

function NativeAdContent({ compact = false }: AdMobNativeAdProps) {
  const { palette } = useTheme();
  const { t } = useTranslation();
  // Use Google's native test unit on both platforms until production units are provided.
  const { nativeAd } = useNativeAd({ adUnitId: TestIds.NATIVE });

  if (!nativeAd) return null;

  return (
    <NativeAdView
      nativeAd={nativeAd}
      style={[styles.card, compact && styles.compactCard, { backgroundColor: palette.card, borderColor: palette.border }]}
    >
      <View style={styles.attribution}>
        <Text style={[styles.adLabel, { color: palette.muted, borderColor: palette.border }]}>
          {t('common.ad')}
        </Text>
        {nativeAd.advertiser ? (
          <NativeAsset assetType={NativeAssetType.ADVERTISER}>
            <Text style={[styles.advertiser, { color: palette.muted }]}>{nativeAd.advertiser}</Text>
          </NativeAsset>
        ) : null}
      </View>
      <View style={styles.heading}>
        {nativeAd.icon ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
          </NativeAsset>
        ) : null}
        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <Text style={[styles.headline, { color: palette.text }]}>{nativeAd.headline}</Text>
        </NativeAsset>
      </View>
      {nativeAd.body ? (
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text style={[styles.body, { color: palette.muted }]}>{nativeAd.body}</Text>
        </NativeAsset>
      ) : null}
      {!compact ? <NativeMediaView resizeMode="contain" style={styles.media} /> : null}
      {nativeAd.callToAction ? (
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Text style={[styles.action, { backgroundColor: palette.primary, color: palette.primaryText }]}>
            {nativeAd.callToAction}
          </Text>
        </NativeAsset>
      ) : null}
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', padding: 12, gap: 10 },
  compactCard: { maxWidth: 480, borderWidth: 1, borderRadius: 12 },
  attribution: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 24 },
  adLabel: { fontSize: 11, borderWidth: 1, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 2 },
  advertiser: { flex: 1, fontSize: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 8 },
  headline: { flex: 1, fontSize: 15, fontWeight: '600' },
  body: { fontSize: 13, lineHeight: 18 },
  media: { width: '100%', height: 180 },
  action: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, textAlign: 'center', fontSize: 14, fontWeight: '600' },
});
