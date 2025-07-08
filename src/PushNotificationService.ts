import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import type { PushNotificationSchema } from "@capacitor/push-notifications";
import type { LocalNotificationSchema } from "@capacitor/local-notifications";

class PushNotificationService {
  private static registrationListeners: PluginListenerHandle[] = [];
  private static notificationListeners: PluginListenerHandle[] = [];
  private static localNotificationListeners: PluginListenerHandle[] = [];
  private static initialized = false;
  private static deviceToken: string | null = null;
  private static currentChatRoomId: string | null = null;

  static setCurrentChatRoomId(roomId: string | null) {
    this.currentChatRoomId = roomId;
  }

  static async init(): Promise<void> {
    // Check if we're on a native platform that supports notifications
    if (!Capacitor.isNativePlatform()) {
      console.log("Push notifications are only available on native platforms");
      return;
    }

    try {
      // Request permissions
      const permissionResult = await PushNotifications.requestPermissions();
      if (permissionResult.receive === "granted") {
        // Register with the platform's push notification service
        await PushNotifications.register();
      } else {
        console.error("Push notification permission not granted");
      }

      // Listen for registration success
      PushNotifications.addListener("registration", (token) => {
        console.log("Push registration success, token: " + token.value);
        localStorage.setItem("pushToken", token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener("registrationError", (error) => {
        console.error("Push registration error: ", error);
      });

      // Handle received notifications when app is in foreground
      PushNotifications.addListener(
        "pushNotificationReceived",
        async (notification) => {
          console.log("Push notification received: ", notification);

          // Only show notification if we're not in the chat room of the sender
          const notificationData = notification.data || {};
          const roomId = notificationData.roomId as string;

          if (roomId !== this.currentChatRoomId) {
            // Create a local notification if we're not in the current room
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: new Date().getTime(),
                  title: notification.title || "New Message",
                  body: notification.body || "You received a new message",
                  smallIcon: "ic_launcher_foreground",
                  largeIcon: "ic_launcher",
                  sound: undefined,
                  extra: notificationData,
                },
              ],
            });
          }
        }
      );

      // Handle when user taps on notification
      PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (actionPerformed) => {
          console.log("Push notification action performed: ", actionPerformed);

          // Navigate to the chat room when notification is tapped
          const data = actionPerformed.notification.data;
          const roomId = data.roomId;

          if (roomId) {
            // Use window.location for navigation
            window.location.href = `/chat/conversation/${roomId}`;
          }
        }
      );

      // Setup local notification action handler for when app is in foreground
      LocalNotifications.addListener(
        "localNotificationActionPerformed",
        (actionPerformed) => {
          console.log("Local notification action performed: ", actionPerformed);

          const data = actionPerformed.notification.extra;
          const roomId = data?.roomId;

          if (roomId) {
            // Use window.location for navigation
            window.location.href = `/chat/conversation/${roomId}`;
          }
        }
      );
    } catch (error) {
      console.error("Error initializing push notifications:", error);
    }
  }

  // Get delivery data (FCM, APNS) token for sending push notifications to this device
  static async getDeliveryToken(): Promise<string | null> {
    try {
      // Return cached token if available
      if (this.deviceToken) {
        console.log(
          "[PushNotificationService] Returning cached device token:",
          this.deviceToken
        );
        return this.deviceToken;
      }

      if (!Capacitor.isNativePlatform()) {
        return null;
      }

      console.log(
        "[PushNotificationService] Checking push notification permissions..."
      );
      // Request permissions first if not already granted
      const permStatus = await PushNotifications.checkPermissions();
      console.log(
        "[PushNotificationService] Permission status:",
        permStatus.receive
      );

      if (permStatus.receive !== "granted") {
        console.log(
          "[PushNotificationService] Permission not granted, requesting..."
        );
        const reqStatus = await PushNotifications.requestPermissions();
        console.log(
          "[PushNotificationService] Request permission result:",
          reqStatus.receive
        );

        if (reqStatus.receive !== "granted") {
          console.warn(
            "[PushNotificationService] Push notification permission not granted"
          );
          return null;
        }
      }

      // Register for push if needed
      console.log(
        "[PushNotificationService] Registering for push notifications..."
      );
      await PushNotifications.register();

      // We can't directly get the token, so we need to wait for the registration event
      return new Promise<string | null>((resolve) => {
        console.log("[PushNotificationService] Waiting for push token...");
        // Create a variable to hold the listener handle once resolved
        let tokenListenerHandle: PluginListenerHandle | null = null;

        // Set up the listener
        PushNotifications.addListener("registration", async (token) => {
          console.log("[PushNotificationService] Got push token:", token.value);
          this.deviceToken = token.value;

          // Remove the listener once we get the token
          if (tokenListenerHandle) {
            tokenListenerHandle.remove();
          }

          resolve(token.value);
        }).then((handle) => {
          // Store the handle for later cleanup
          tokenListenerHandle = handle;
        });

        // Set a timeout to avoid hanging indefinitely
        setTimeout(() => {
          if (tokenListenerHandle) {
            tokenListenerHandle.remove();
          }
          console.log(
            "[PushNotificationService] Timed out waiting for push token"
          );
          resolve(null);
        }, 10000); // Increased timeout to 10 seconds
      });
    } catch (error) {
      console.error(
        "[PushNotificationService] Error getting delivery token:",
        error
      );
      return null;
    }
  }

  // Get the list of delivered push notifications
  static async getDeliveredNotifications(): Promise<PushNotificationSchema[]> {
    try {
      const notificationList =
        await PushNotifications.getDeliveredNotifications();
      console.log(
        "[PushNotificationService] Delivered notifications:",
        JSON.stringify(notificationList.notifications)
      );
      return notificationList.notifications;
    } catch (error) {
      console.error(
        "[PushNotificationService] Error getting delivered notifications:",
        error
      );
      return [];
    }
  }

  // Remove all delivered push notifications
  static async removeAllDeliveredNotifications(): Promise<void> {
    try {
      await PushNotifications.removeAllDeliveredNotifications();
      console.log(
        "[PushNotificationService] All delivered notifications removed"
      );
    } catch (error) {
      console.error(
        "[PushNotificationService] Error removing delivered notifications:",
        error
      );
    }
  }

  // Remove delivered push notifications by identifier
  static async removeDeliveredNotifications(
    identifiers: PushNotificationSchema[]
  ): Promise<void> {
    try {
      await PushNotifications.removeDeliveredNotifications({
        notifications: identifiers,
      });
      console.log(
        "[PushNotificationService] Removed specific delivered notifications:",
        JSON.stringify(identifiers)
      );
    } catch (error) {
      console.error(
        "[PushNotificationService] Error removing specific delivered notifications:",
        error
      );
    }
  }

  // Schedule a local notification
  static async scheduleLocalNotification(
    notification: LocalNotificationSchema
  ): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [notification],
      });
      console.log(
        "[PushNotificationService] Local notification scheduled:",
        JSON.stringify(notification)
      );
    } catch (error) {
      console.error(
        "[PushNotificationService] Error scheduling local notification:",
        error
      );
    }
  }

  // Get pending local notifications
  static async getPendingLocalNotifications(): Promise<
    LocalNotificationSchema[]
  > {
    try {
      const pendingList = await LocalNotifications.getPending();
      console.log(
        "[PushNotificationService] Pending local notifications:",
        JSON.stringify(pendingList.notifications)
      );
      return pendingList.notifications;
    } catch (error) {
      console.error(
        "[PushNotificationService] Error getting pending local notifications:",
        error
      );
      return [];
    }
  }

  // Cancel all pending local notifications
  static async cancelAllPendingLocalNotifications(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [] });
      console.log(
        "[PushNotificationService] All pending local notifications cancelled"
      );
    } catch (error) {
      console.error(
        "[PushNotificationService] Error cancelling all pending local notifications:",
        error
      );
    }
  }

  // Show a notification immediately
  static async showNotification(title: string, body: string, data: any = {}) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: new Date().getTime(),
            title,
            body,
            extra: data,
          },
        ],
      });
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }
}

export default PushNotificationService;
