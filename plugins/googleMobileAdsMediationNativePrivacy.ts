import * as fs from 'node:fs';
import * as path from 'node:path';

const ANDROID_MEDIATION_PACKAGE_BLOCK = `          // @generated begin google-mobile-ads-mediation-package
          add(MediationPrivacyPackage())
          // @generated end google-mobile-ads-mediation-package`;

const IOS_MEDIATION_PRIVACY_MODULE_FILENAME = 'MediationPrivacyModule.m';
const IOS_MEDIATION_PRIVACY_MODULE_SOURCE = `#import <React/RCTBridgeModule.h>
#import <objc/message.h>

@interface MediationPrivacyModule : NSObject <RCTBridgeModule>
@end

@implementation MediationPrivacyModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(sync:(BOOL)allowsPersonalizedAds)
{
  Class pangleClass = NSClassFromString(@"GADMediationAdapterPangle");
  SEL pangleConsentSelector = NSSelectorFromString(@"setPAConsent:");
  if (pangleClass && [pangleClass respondsToSelector:pangleConsentSelector]) {
    NSInteger paConsent = allowsPersonalizedAds ? 1 : 0;
    ((void (*)(id, SEL, NSInteger))objc_msgSend)(pangleClass, pangleConsentSelector, paConsent);
  }

  Class liftoffClass = NSClassFromString(@"VunglePrivacySettings");
  SEL liftoffConsentSelector = NSSelectorFromString(@"setCCPAStatus:");
  if (liftoffClass && [liftoffClass respondsToSelector:liftoffConsentSelector]) {
    ((void (*)(id, SEL, BOOL))objc_msgSend)(liftoffClass, liftoffConsentSelector, allowsPersonalizedAds);
  }
}

@end
`;

function findFile(root: string, fileName: string): string {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isFile() && entry.name === fileName) {
      return fullPath;
    }
    if (entry.isDirectory()) {
      const found = findFile(fullPath, fileName);
      if (found) {
        return found;
      }
    }
  }

  throw new Error(`Unable to find ${fileName} under ${root}`);
}

function syncAndroidMainApplication(contents: string): string {
  const nextContents = contents
    .replace(
      /\n\s*\/\/ @generated begin google-mobile-ads-mediation-package[\s\S]*?\/\/ @generated end google-mobile-ads-mediation-package\n/g,
      '\n',
    )
    .replace(/\n{3,}/g, '\n\n');

  return nextContents.replace(
    /(\/\/ add\(MyReactNativePackage\(\)\)\n)/,
    `$1${ANDROID_MEDIATION_PACKAGE_BLOCK}\n`,
  );
}

function buildAndroidMediationPrivacyModuleSource(packageName: string): string {
  return `package ${packageName}

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

private const val IAB_US_PRIVACY_STRING_KEY = "IABUSPrivacy_String"
private const val PANGLE_MEDIATION_ADAPTER_CLASS = "com.google.ads.mediation.pangle.PangleMediationAdapter"
private const val VUNGLE_PRIVACY_SETTINGS_CLASS = "com.vungle.ads.VunglePrivacySettings"

class MediationPrivacyModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "MediationPrivacyModule"

  @ReactMethod
  fun sync(allowsPersonalizedAds: Boolean) {
    syncPangleConsent()
    syncLiftoffConsent(allowsPersonalizedAds)
  }

  private fun syncPangleConsent() {
    val prefs = reactApplicationContext.getSharedPreferences(
      "\${reactApplicationContext.packageName}_preferences",
      Context.MODE_PRIVATE,
    )
    val usPrivacyString = prefs.getString(IAB_US_PRIVACY_STRING_KEY, null)
    if (usPrivacyString.isNullOrBlank() || usPrivacyString.length < 3) return

    val paConsent = if (usPrivacyString[2].uppercaseChar() == 'Y') 0 else 1
    runStaticMethodIfPresent(
      PANGLE_MEDIATION_ADAPTER_CLASS,
      "setPAConsent",
      Int::class.javaPrimitiveType,
      paConsent,
    )
  }

  private fun syncLiftoffConsent(allowsPersonalizedAds: Boolean) {
    runStaticMethodIfPresent(
      VUNGLE_PRIVACY_SETTINGS_CLASS,
      "setCCPAStatus",
      Boolean::class.javaPrimitiveType,
      allowsPersonalizedAds,
    )
  }

  private fun runStaticMethodIfPresent(
    className: String,
    methodName: String,
    parameterType: Class<*>?,
    argument: Any,
  ): Boolean {
    val valueType = parameterType ?: return false
    return try {
      Class.forName(className).getMethod(methodName, valueType).invoke(null, argument)
      true
    } catch (_: ReflectiveOperationException) {
      false
    } catch (_: LinkageError) {
      false
    } catch (_: IllegalArgumentException) {
      false
    }
  }
}
`;
}

function buildAndroidMediationPrivacyPackageSource(packageName: string): string {
  return `package ${packageName}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class MediationPrivacyPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(MediationPrivacyModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
`;
}

export {
  buildAndroidMediationPrivacyModuleSource,
  buildAndroidMediationPrivacyPackageSource,
  findFile,
  IOS_MEDIATION_PRIVACY_MODULE_FILENAME,
  IOS_MEDIATION_PRIVACY_MODULE_SOURCE,
  syncAndroidMainApplication,
};
