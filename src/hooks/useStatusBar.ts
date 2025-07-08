import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { App } from "@capacitor/app";

export function useStatusBar() {
  useEffect(() => {
    const setupStatusBar = async () => {
      if (
        Capacitor.isPluginAvailable("StatusBar") &&
        Capacitor.isNativePlatform()
      ) {
        try {
          // Hide first (this seems to work better on iOS)
          await StatusBar.hide();

          // Then set style
          await StatusBar.setStyle({ style: Style.Dark });
        } catch (err) {
          console.error("Error configuring status bar:", err);
        }
      }
    };

    // Setup status bar immediately
    setupStatusBar();

    // Also setup after a delay to ensure it works after app initialization
    const timer = setTimeout(() => {
      setupStatusBar();
    }, 300);

    // Add event listener for app resume to ensure status bar stays hidden
    if (Capacitor.isPluginAvailable("App")) {
      App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          // App came to foreground
          setupStatusBar();
        }
      });
    }

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (Capacitor.isPluginAvailable("App")) {
        App.removeAllListeners();
      }
    };
  }, []);
}

export default useStatusBar;
