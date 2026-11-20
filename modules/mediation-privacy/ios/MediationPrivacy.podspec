Pod::Spec.new do |s|
  s.name = 'MediationPrivacy'
  s.version = '1.0.0'
  s.summary = 'SendQuiz mediation privacy settings'
  s.homepage = 'https://sendquiz.net'
  s.license = 'Proprietary'
  s.author = 'SendQuiz'
  s.source = { :path => '.' }
  s.platform = :ios, '16.4'
  s.source_files = '*.swift'
  s.dependency 'ExpoModulesCore'
  s.dependency 'GoogleMobileAdsMediationPangle', '8.4.0.8.0'
  s.dependency 'GoogleMobileAdsMediationVungle', '7.7.8.0'
end
