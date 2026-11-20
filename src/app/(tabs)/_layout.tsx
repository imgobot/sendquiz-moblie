import { NativeTabs } from 'expo-router/native-tabs';
import { useTranslation } from 'react-i18next';
import { TabAdContext } from '../../components/ads/TabContentAd';
import { AdMobNativeAd } from '../../components/ads';

export const unstable_settings = { initialRouteName: '(home)' };

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <TabAdContext value={<AdMobNativeAd />}>
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
          <NativeTabs.Trigger.Label>{t('tab.home')}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(settings)">
          <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
          <NativeTabs.Trigger.Label>{t('tab.settings')}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabAdContext>
  );
}
