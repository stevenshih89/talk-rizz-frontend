import React, { useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

const PushNotificationHandler: React.FC = () => {
  useEffect(() => {
    // Function to ensure the app stays in fullscreen mode with a delay
    const ensureFullscreen = async () => {
      if (
        Capacitor.isPluginAvailable("StatusBar") &&
        Capacitor.isNativePlatform()
      ) {
        try {
          // Set style first
          await StatusBar.setStyle({ style: Style.Dark });

          // Then hide with a small delay
          setTimeout(async () => {
            await StatusBar.hide();
          }, 100);
        } catch (err) {
          console.error("Error configuring status bar:", err);
        }
      }
    };

    // Register for push notification permission changes
    const registerForPushPermissionChanges = async () => {
      if (
        Capacitor.isPluginAvailable("PushNotifications") &&
        Capacitor.isNativePlatform()
      ) {
        try {
          // Add listeners for push notification events
          PushNotifications.addListener("registration", (token) => {
            console.log("Push registration success:", token.value);
            // When registration is successful, ensure we're still in fullscreen
            ensureFullscreen();
          });

          PushNotifications.addListener("registrationError", (error) => {
            console.error("Push registration error:", error);
            // Even on error, ensure we're still in fullscreen
            ensureFullscreen();
          });

          // Also listen for permission changes
          PushNotifications.addListener(
            "pushNotificationReceived",
            (notification) => {
              console.log("Push notification received:", notification);
              ensureFullscreen();
            }
          );

          PushNotifications.addListener(
            "pushNotificationActionPerformed",
            (notification) => {
              console.log("Push notification action performed:", notification);
              ensureFullscreen();
            }
          );
        } catch (err) {
          console.error("Error setting up push notification listeners:", err);
        }
      }
    };

    // Call functions with a delay to ensure app is fully initialized
    setTimeout(() => {
      ensureFullscreen();
      registerForPushPermissionChanges();
    }, 500);

    // Clean up listeners
    return () => {
      if (
        Capacitor.isPluginAvailable("PushNotifications") &&
        Capacitor.isNativePlatform()
      ) {
        PushNotifications.removeAllListeners();
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default PushNotificationHandler;
