import React, { useEffect, useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { AdMobService } from "./utils/admob";
import PushNotificationService from "./PushNotificationService";
import { Capacitor } from "@capacitor/core";
import { initializeApp } from "firebase/app";
import { supabase } from "./config/supabase";

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

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBznzFT3gMDdBT10sUTsPi7gjSk6SInUBQ",
  authDomain: "catnnect-ab73f.firebaseapp.com",
  projectId: "catnnect-ab73f",
  storageBucket: "catnnect-ab73f.firebasestorage.app",
  messagingSenderId: "871084142539",
  appId: "1:871084142539:android:daae6bb42cb5243f1cd04e",
};

// Initialize Firebase if on Android
if (Capacitor.getPlatform() === "android") {
  initializeApp(firebaseConfig);
}

const App: React.FC = () => {
  const [adInitialized, setAdInitialized] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [hideValue, setHideValue] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Function to check if the current path is part of the onboarding or auth flow
  const isOnboardingOrAuthPath = (path: string): boolean => {
    return (
      path === "/" ||
      path.startsWith("/onboarding") ||
      path.startsWith("/auth/") ||
      path === "/auth/login"
    );
  };

  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // Check auth state
  useEffect(() => {
    const checkAuthState = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);

      // Subscribe to auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkAuthState();
  }, []);

  useEffect(() => {
    // Initialize push notifications
    PushNotificationService.init().catch((err) => {
      console.error("Error initializing push notifications:", err);
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

        // Only show ads if user is authenticated AND not in onboarding/auth paths
        if (isAuthenticated && !isOnboardingOrAuthPath(currentPath)) {
          displayAd(adMobService);
        } else {
          // Hide any existing ads when in onboarding/auth flow
          adMobService.hideBannerAd().catch((error) => {
            console.log("Error hiding banner ad:", error);
          });
          setHideValue(false);
        }
      } catch (error) {
        console.error("Error initializing AdMob:", error);
        setAdError(
          error instanceof Error ? error.message : "Failed to initialize AdMob"
        );
      }
    };

    const displayAd = async (adMobService: AdMobService) => {
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
    };

    // Add visibility listener
    adMobService.addVisibilityListener(handleAdVisibility);

    // Initialize AdMob
    initializeAdMob();

    // Cleanup
    return () => {
      adMobService.removeVisibilityListener(handleAdVisibility);
    };
  }, [isAuthenticated, currentPath]);

  // Determine whether to show Google Ad or the image
  const shouldShowImage =
    !hideValue || !isAuthenticated || isOnboardingOrAuthPath(currentPath);

  useEffect(() => {
    console.log("Ad visibility state:", {
      hideValue,
      isAuthenticated,
      currentPath,
      isOnboardingPath: isOnboardingOrAuthPath(currentPath),
      shouldShowImage,
    });
  }, [hideValue, isAuthenticated, currentPath]);

  const mainContainerStyle = {
    marginTop: shouldShowImage ? "100px" : "50px",
    height: shouldShowImage ? "calc(100vh - 100px)" : "calc(100vh - 50px)",
  };

  return (
    <>
      {shouldShowImage ? (
        <div
          style={{
            height: "50px",
            backgroundColor: "#121212",
            marginTop: "50px",
          }}
        >
          <img
            src="/assets/images/Catnnect_Feature_graphic.png"
            alt="Ad Banner"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : null}

      <IonApp className="background" style={mainContainerStyle}>
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
