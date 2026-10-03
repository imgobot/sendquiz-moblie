import { Platform } from 'react-native';
import {
  getTrackingPermissionsAsync,
  isAvailable,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

let trackingPermissionRequested = false;

export async function requestTrackingPermissionIfNeeded() {
  if (trackingPermissionRequested) return;
  trackingPermissionRequested = true;

  if (Platform.OS !== 'ios') return;

  const available = await isAvailable();
  if (!available) return;

  const { status } = await getTrackingPermissionsAsync();
  if (status !== 'undetermined') return;

  await requestTrackingPermissionsAsync();
}
