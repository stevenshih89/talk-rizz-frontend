import UIKit
import Capacitor
import FirebaseCore

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Configure Firebase with more robust error handling
        configureFirebase()
        
        return true
    }
    
    private func configureFirebase() {
        // Try different locations for the GoogleService-Info.plist file
        let possiblePlistPaths = [
            Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
            Bundle.main.bundlePath + "/GoogleService-Info.plist",
            Bundle.main.resourcePath! + "/GoogleService-Info.plist",
            FileManager.default.currentDirectoryPath + "/GoogleService-Info.plist"
        ]
        
        // Print all paths for debugging
        print("Searching for GoogleService-Info.plist in the following locations:")
        for (index, path) in possiblePlistPaths.enumerated() {
            if let path = path {
                print("\(index): \(path) - Exists: \(FileManager.default.fileExists(atPath: path))")
            } else {
                print("\(index): nil path")
            }
        }
        
        // Try to find a valid plist file
        for path in possiblePlistPaths {
            if let path = path, FileManager.default.fileExists(atPath: path) {
                print("Found GoogleService-Info.plist at: \(path)")
                do {
                    // Read the file content for debugging
                    let data = try Data(contentsOf: URL(fileURLWithPath: path))
                    print("Successfully read \(data.count) bytes from plist file")
                    
                    // Configure Firebase with this file
                    if let options = FirebaseOptions(contentsOfFile: path) {
                        FirebaseApp.configure(options: options)
                        print("Firebase configured successfully with options from plist file")
                        return
                    } else {
                        print("Error: Failed to create Firebase options from file at \(path)")
                    }
                } catch {
                    print("Error reading plist file: \(error)")
                }
            }
        }
        
        // If we get here, we couldn't find a valid plist file
        print("WARNING: Could not find a valid GoogleService-Info.plist file. Trying default configuration.")
        
        // Try default configuration as a last resort
        do {
            FirebaseApp.configure()
            print("Firebase configured with default configuration")
        } catch {
            print("Failed to configure Firebase with default configuration: \(error)")
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)

        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let statusBarManager = windowScene.statusBarManager {
            let statusBarFrame = statusBarManager.statusBarFrame
            guard let touchPoint = event?.allTouches?.first?.location(in: self.window) else { return }

            if statusBarFrame.contains(touchPoint) {
                NotificationCenter.default.post(name: .capacitorStatusBarTapped, object: nil)
            }
        }
    }
}
