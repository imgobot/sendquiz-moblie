package expo.modules.mediationprivacy

import com.google.ads.mediation.pangle.PangleMediationAdapter
import com.vungle.ads.VunglePrivacySettings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MediationPrivacyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MediationPrivacy")
    Function("setUSPrivacy") { optedOut: Boolean ->
      PangleMediationAdapter.setPAConsent(if (optedOut) 0 else 1)
      VunglePrivacySettings.setCCPAStatus(!optedOut)
    }
  }
}
