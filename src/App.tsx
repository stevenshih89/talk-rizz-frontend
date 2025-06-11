import React, { useEffect, useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Capacitor } from "@capacitor/core";
import RootScreen from "./pages/Root";
import { AuthProvider } from "./contexts/AuthContext";
import { DeepLinkHandler } from "./components/DeepLinkHandler";
import { AdMobService } from "./utils/admob";

// Ionic Core CSS
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

// Theme
import "./theme/variables.css";
import "./theme/tailwindcss.css";

setupIonicReact();

const App: React.FC = () => {
  const [adInitialized, setAdInitialized] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAdMob = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          console.log("Initializing AdMob...");
          const adMobService = AdMobService.getInstance();
          await adMobService.initialize();
          setAdInitialized(true);
          console.log("AdMob initialized successfully");

          setTimeout(async () => {
            try {
              await adMobService.showBannerAd();
              console.log("Banner ad shown successfully");
            } catch (error) {
              console.error("Error showing banner ad:", error);
              setAdError(
                error instanceof Error
                  ? error.message
                  : "Failed to show banner ad"
              );
            }
          }, 2000);
        } catch (error) {
          console.error("Error initializing AdMob:", error);
          setAdError(
            error instanceof Error
              ? error.message
              : "Failed to initialize AdMob"
          );
        }
      } else {
        console.log("AdMob not initialized: not a native platform");
      }
    };

    initializeAdMob();
  }, []);

  return (
    <IonApp className="background">
      <IonReactRouter>
        <AuthProvider>
          <DeepLinkHandler />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            <div style={{ flex: 1, overflow: "auto" }}>
              <RootScreen />
            </div>
          </div>
        </AuthProvider>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
