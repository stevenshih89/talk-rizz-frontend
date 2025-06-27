import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.catnnect.connect",
  // appId: "com.catnnect.ios",
  appName: "Catnnect Connect",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    AdMob: {
      appId: "ca-app-pub-7556755881195797~4201273301",
      bannerAdId: "ca-app-pub-7556755881195797/2273722777",
      interstitialAdId: "ca-app-pub-7556755881195797/2273722777",
      rewardedAdId: "ca-app-pub-7556755881195797/2273722777",
      isTesting: true,
    },
    SignInWithApple: {
      clientId: "com.catnnect.ios",
      redirectURI: "App://oauth",
      scopes: "email name",
    },
    FirebaseMessaging: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  ios: {
    scheme: "App",
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
