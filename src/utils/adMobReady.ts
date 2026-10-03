import { useSyncExternalStore } from 'react';

type AdMobReadyListener = () => void;

let adMobReady = false;
const adMobReadyListeners = new Set<AdMobReadyListener>();

function getAdMobReadySnapshot() {
  return adMobReady;
}

function subscribeAdMobReady(listener: AdMobReadyListener) {
  adMobReadyListeners.add(listener);
  return () => {
    adMobReadyListeners.delete(listener);
  };
}

export function useAdMobReady() {
  return useSyncExternalStore(subscribeAdMobReady, getAdMobReadySnapshot);
}

export function setAdMobReady(nextValue: boolean) {
  if (adMobReady === nextValue) return;
  adMobReady = nextValue;
  adMobReadyListeners.forEach((listener) => listener());
}
