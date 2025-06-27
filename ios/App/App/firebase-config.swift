import Foundation
import FirebaseCore

class FirebaseConfiguration {
    static func configure() {
        // Print bundle info for debugging
        print("Bundle identifier: \(Bundle.main.bundleIdentifier ?? "unknown")")
        print("Bundle path: \(Bundle.main.bundlePath)")
        print("Resource path: \(Bundle.main.resourcePath ?? "unknown")")
        
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
                print("Error: Failed to load Firebase options from file at \(filePath)")
            }
        } else {
            print("GoogleService-Info.plist not found in main bundle resources")
            
            // Search for the file in alternative locations
            let fileManager = FileManager.default
            let possiblePaths = [
                Bundle.main.bundlePath + "/GoogleService-Info.plist",
                Bundle.main.bundlePath + "/Frameworks/GoogleService-Info.plist",
                Bundle.main.resourcePath! + "/GoogleService-Info.plist",
                fileManager.currentDirectoryPath + "/GoogleService-Info.plist",
                // Add the direct path to the file in the project directory
                Bundle.main.bundlePath + "/../GoogleService-Info.plist"
            ]
            
            print("Searching for GoogleService-Info.plist in alternative locations:")
            for (index, path) in possiblePaths.enumerated() {
                let exists = fileManager.fileExists(atPath: path)
                print("\(index): \(path) - Exists: \(exists)")
                
                if exists {
                    print("GoogleService-Info.plist found at alternative path: \(path)")
                    do {
                        // Read the file content for debugging
                        let data = try Data(contentsOf: URL(fileURLWithPath: path))
                        print("Successfully read \(data.count) bytes from plist file")
                        
                        if let options = FirebaseOptions(contentsOfFile: path) {
                            if FirebaseApp.app() == nil {
                                FirebaseApp.configure(options: options)
                                print("Firebase configured successfully with options from alternative path")
                            }
                            return
                        } else {
                            print("Error: Failed to create Firebase options from file at \(path)")
                        }
                    } catch {
                        print("Error reading plist file: \(error)")
                    }
                }
            }
            
            print("Error: GoogleService-Info.plist not found in any location")
            
            // Try to manually create the options as a last resort
            print("Attempting to manually create Firebase options...")
            let options = FirebaseOptions(googleAppID: "1:871084142539:ios:8813cca4d0c0c5201cd04e", 
                                         gcmSenderID: "871084142539")
            options.apiKey = "AIzaSyDZYVhx2TYOtO7PKG1y56T1KFn_e4jQqK4"
            options.projectID = "catnnect-ab73f"
            options.storageBucket = "catnnect-ab73f.firebasestorage.app"
            options.bundleID = "com.catnnect.ios"
            
            if FirebaseApp.app() == nil {
                FirebaseApp.configure(options: options)
                print("Firebase configured with manually created options")
                return
            }
        }
        
        // Fallback to default configuration (this might still fail)
        if FirebaseApp.app() == nil {
            print("Attempting default Firebase configuration...")
            FirebaseApp.configure()
            print("Firebase configured with default configuration")
        }
    }
} 