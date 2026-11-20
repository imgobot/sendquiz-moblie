import ExpoModulesCore
import PangleAdapter
import VungleAdsSDK

public class MediationPrivacyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MediationPrivacy")
    Function("setUSPrivacy") { (optedOut: Bool) in
      GADMediationAdapterPangle.setPAConsent(optedOut ? 0 : 1)
      VunglePrivacySettings.setCCPAStatus(!optedOut)
    }
  }
}
