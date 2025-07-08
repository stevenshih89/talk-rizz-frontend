import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // appId: "io.catnnect.connect",
  appId: "com.catnnect.ios",
  appName: "Catnnect Connect",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert", "banner", "list"],
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
    LocalNotifications: {
      smallIcon: "ic_launcher_foreground",
      iconColor: "#488AFF",
      sound: "default",
    },
    CapacitorHttp: {
      enabled: true,
    },
    App: {
      appUrlOpen: {
        enabled: true,
      },
    },
    StatusBar: {
      style: "dark",
    },
  },
  ios: {
    scheme: "App",
    backgroundColor: "#000000",
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    backgroundColor: "#ffffff",
  },
};

export default config;
