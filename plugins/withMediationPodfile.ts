type ConfigPlugin = import('expo/config-plugins').ConfigPlugin;
const { withPodfile } = require('expo/config-plugins') as typeof import('expo/config-plugins');

const withMediationPodfile: ConfigPlugin = config => withPodfile(config, mod => {
  const pin = "$RNGoogleMobileAdsSDKVersion = '13.12.0'";
  const contents = mod.modResults.contents.replace(/^\$RNGoogleMobileAdsSDKVersion = .*\n/gm, '');
  mod.modResults.contents = pin + '\n' + contents;
  return mod;
});

module.exports = withMediationPodfile;
