import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

class PushNotificationService {
  private static currentChatRoomId: string | null = null;

  static setCurrentChatRoomId(roomId: string | null) {
    this.currentChatRoomId = roomId;
  }

  static async init() {
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
        (actionPerformed: any) => {
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

  static async showNotification(title: string, body: string, data: any = {}) {
    // Don't show notification if we're already in the chat room
    if (data.roomId === this.currentChatRoomId) {
      return;
    }

    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: new Date().getTime(),
            title: title,
            body: body,
            smallIcon: "ic_launcher_foreground",
            largeIcon: "ic_launcher",
            sound: undefined,
            extra: data,
          },
        ],
      });
    } else {
      // Fallback for web
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
    }
  }
}

export default PushNotificationService;
