import Foundation
import Capacitor
import UserNotifications

class NotificationsHandler: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationsHandler()
    
    func registerForPushNotifications() {
        UNUserNotificationCenter.current().delegate = self
    }
    
    // Show notification when app is in foreground
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge, .list])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
    
    // Handle notification response
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        print("Notification tapped: \(userInfo)")
        
        // Complete
        completionHandler()
    }
} 