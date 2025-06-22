import React, { useEffect, useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { AdMobService } from "./utils/admob";
import PushNotificationService from "./PushNotificationService";

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

setupIonicReact();

const App: React.FC = () => {
  const [adInitialized, setAdInitialized] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [hideValue, setHideValue] = useState(false);

  useEffect(() => {
    // Initialize push notifications
    PushNotificationService.init().catch(err => {
      console.error('Error initializing push notifications:', err);
    });
    
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
            await adMobService.showBannerAd();

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
      <div style={{ display: hideValue ? "none" : "block", height: "50px" }}>
        {/* Your content to hide when ad is visible */}
        <h1>Content to hide when ad is visible</h1>
      </div>

      <IonApp
        className="background"
        style={{ height: "calc(100vh - 50px)", marginTop: "50px" }}
      >
        <IonReactRouter>
          <AuthProvider>
            <DeepLinkHandler />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                position: "relative",
              }}
            >
              <div style={{ flex: 1, overflow: "auto" }}>
                <RootScreen />
              </div>
            </div>
          </AuthProvider>
        </IonReactRouter>
      </IonApp>
    </>
  );
};

export default App;
