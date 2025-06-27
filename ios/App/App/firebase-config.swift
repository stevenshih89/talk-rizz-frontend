import Foundation
import FirebaseCore

class FirebaseConfiguration {
    static func configure() {
        // Check for the file in the main bundle first
        if let filePath = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") {
            print("GoogleService-Info.plist found at: \(filePath)")
            if let options = FirebaseOptions(contentsOfFile: filePath) {
                if FirebaseApp.app() == nil {
                    FirebaseApp.configure(options: options)
                    print("Firebase configured successfully with options from plist file")
                }
                return
            } else {
                print("Error: Failed to load Firebase options from file")
            }
        } else {
            // Search for the file in alternative locations
            let fileManager = FileManager.default
            let possiblePaths = [
                Bundle.main.bundlePath + "/GoogleService-Info.plist",
                Bundle.main.bundlePath + "/Frameworks/GoogleService-Info.plist",
                Bundle.main.resourcePath! + "/GoogleService-Info.plist",
                fileManager.currentDirectoryPath + "/GoogleService-Info.plist"
            ]
            
            for path in possiblePaths {
                if fileManager.fileExists(atPath: path) {
                    print("GoogleService-Info.plist found at alternative path: \(path)")
                    if let options = FirebaseOptions(contentsOfFile: path) {
                        if FirebaseApp.app() == nil {
                            FirebaseApp.configure(options: options)
                            print("Firebase configured successfully with options from alternative path")
                        }
                        return
                    }
                }
            }
            
            print("Error: GoogleService-Info.plist not found in any location")
        }
        
        // Fallback to default configuration (this might still fail)
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
            print("Firebase configured with default configuration")
        }
    }
} 