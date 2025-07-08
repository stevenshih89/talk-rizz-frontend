import React, { useEffect, useState } from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { AdMobService } from "./utils/admob";
import PushNotificationService from "./PushNotificationService";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import useStatusBar from "./hooks/useStatusBar";
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
} from "@capacitor-community/admob";

// Import Ionic CSS
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "./theme/variables.css";
import "./theme/tailwindcss.css";

import RootScreen from "./pages/Root";
import { AuthProvider } from "./contexts/AuthContext";
import { IonReactRouter } from "@ionic/react-router";
import { DeepLinkHandler } from "./components/DeepLinkHandler";

// Simple setup
setupIonicReact();

const App: React.FC = () => {
  const [adInitialized, setAdInitialized] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [hideValue, setHideValue] = useState(false);

  // Use the status bar hook to ensure fullscreen display
  useStatusBar();

  useEffect(() => {
    // Configure status bar
    const setupStatusBar = async () => {
      if (
        Capacitor.isPluginAvailable("StatusBar") &&
        Capacitor.isNativePlatform()
      ) {
        try {
          // Set status bar style first
          await StatusBar.setStyle({ style: Style.Dark });

          // Hide status bar
          await StatusBar.hide();
        } catch (err) {
          console.error("Error configuring status bar:", err);
        }
      }
    };

    // Initialize push notifications
    PushNotificationService.init();

    // Setup status bar with a delay to ensure app is fully initialized
    setTimeout(() => {
      setupStatusBar();
    }, 300);

    const adMobService = AdMobService.getInstance();

    const handleAdVisibility = (isVisible: boolean) => {
      setHideValue(isVisible); // When ad is visible, hide the content
    };

    const initializeAdMob = async () => {
      try {
        console.log("Starting AdMob initialization in App component...");
        await adMobService.initialize();
        setAdInitialized(true);
        console.log("AdMob initialized in App component");

        // Add a small delay before showing the ad
        setTimeout(async () => {
          try {
            console.log("Attempting to show banner ad...");
            await AdMob.showBanner({
              adId: "ca-app-pub-7556755881195797/2273722777",
              adSize: BannerAdSize.ADAPTIVE_BANNER,
              position: BannerAdPosition.TOP_CENTER,
            });

            // Check status after 3 seconds
            setTimeout(() => {
              adMobService.checkAdStatus();
            }, 3000);
          } catch (error) {
            console.error("Error showing banner ad:", error);
            setAdError(
              error instanceof Error ? error.message : "Failed to show ad"
            );
          }
        }, 2000);
      } catch (error) {
        console.error("Error initializing AdMob:", error);
        setAdError(
          error instanceof Error ? error.message : "Failed to initialize AdMob"
        );
      }
    };

    // Add visibility listener
    adMobService.addVisibilityListener(handleAdVisibility);

    // Initialize AdMob
    initializeAdMob();

    // Cleanup
    return () => {
      adMobService.removeVisibilityListener(handleAdVisibility);
    };
  }, []);

  return (
    <>
      <div
        style={{
          display: hideValue ? "none" : "block",
          height: "50px",
          backgroundColor: "#121212",
        }}
      ></div>
      <IonApp
        className="background"
        // style={{ height: "100vh"}}
        style={{ height: "calc(100vh - 50px)", marginTop: "50px" }}
      >
        <IonReactRouter>
          <AuthProvider>
            <DeepLinkHandler />
            <div style={{ marginTop: "50px" }}>
              <IonRouterOutlet>
                <RootScreen />
              </IonRouterOutlet>
            </div>
          </AuthProvider>
        </IonReactRouter>
      </IonApp>
    </>
  );
};

export default App;
