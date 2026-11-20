import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus, type AdsConsentInfo } from 'react-native-google-mobile-ads';
import { applyConsent, gatherConsent } from '../utils/adMobStartup';

const AdsContext = createContext({
  ready: false,
  privacyOptionsRequired: false,
  openPrivacyOptions: async () => {},
});

export function AdsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
  const startup = useRef<Promise<AdsConsentInfo> | undefined>(undefined);
  const presenting = useRef(false);

  async function update(info: AdsConsentInfo) {
    try {
      await applyConsent(info);
      setReady(info.canRequestAds);
    } finally {
      setPrivacyOptionsRequired(
        info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      );
    }
  }

  useEffect(() => {
    let active = true;
    startup.current ??= gatherConsent();
    void startup.current
      .then(info => { if (active) return update(info); })
      .catch(error => console.warn('ADMOB_STARTUP_FAILED', error));
    return () => { active = false; };
  }, []);

  async function openPrivacyOptions() {
    if (presenting.current) return;
    presenting.current = true;
    setReady(false);
    try {
      const info = await AdsConsent.showPrivacyOptionsForm().catch(error => {
        console.warn('ADMOB_PRIVACY_FORM_FAILED', error);
        return AdsConsent.getConsentInfo();
      });
      await update(info);
    } finally {
      presenting.current = false;
    }
  }

  return <AdsContext.Provider value={{ ready, privacyOptionsRequired, openPrivacyOptions }}>{children}</AdsContext.Provider>;
}

export const useAds = () => useContext(AdsContext);
