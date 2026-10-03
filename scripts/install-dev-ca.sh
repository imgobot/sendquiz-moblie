#!/usr/bin/env bash
set -euo pipefail

ROOT_CA="$(mkcert -CAROOT)/rootCA.pem"

if [[ ! -f "$ROOT_CA" ]]; then
  echo "mkcert root CA를 찾을 수 없습니다: $ROOT_CA" >&2
  exit 1
fi

if command -v xcrun >/dev/null 2>&1; then
  if xcrun simctl list devices booted | grep -q "(Booted)"; then
    xcrun simctl keychain booted add-root-cert "$ROOT_CA"
    echo "iOS booted Simulator에 mkcert root CA를 설치했습니다."
  else
    echo "부팅된 iOS Simulator가 없어 iOS 설치를 건너뜁니다."
  fi
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "adb를 찾을 수 없어 Android 설치를 건너뜁니다."
  exit 0
fi

ANDROID_DEVICES="$(adb devices | awk 'NR > 1 && $2 == "device" { print $1 }')"
if [[ -z "$ANDROID_DEVICES" ]]; then
  echo "연결된 Android Emulator가 없어 Android 설치를 건너뜁니다."
  exit 0
fi

CERT_HASH="$(openssl x509 -inform PEM -subject_hash_old -in "$ROOT_CA" -noout)"
TEMP_CERT="/tmp/${CERT_HASH}.0"
cp "$ROOT_CA" "$TEMP_CERT"

for DEVICE in $ANDROID_DEVICES; do
  echo "Android Emulator 인증서 설치: $DEVICE"
  adb -s "$DEVICE" root >/dev/null
  adb -s "$DEVICE" remount >/dev/null
  adb -s "$DEVICE" push "$TEMP_CERT" "/system/etc/security/cacerts/${CERT_HASH}.0" >/dev/null
  adb -s "$DEVICE" shell chmod 644 "/system/etc/security/cacerts/${CERT_HASH}.0"
  adb -s "$DEVICE" reboot
  echo "$DEVICE 재부팅 후 mkcert root CA가 system CA로 적용됩니다."
done
