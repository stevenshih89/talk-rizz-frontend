import UIKit
import Capacitor

extension UIViewController {
    // This will be called when the view controller appears
    open override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        setNeedsStatusBarAppearanceUpdate()
    }
    
    // Hide status bar
    open override var prefersStatusBarHidden: Bool {
        return true
    }
    
    // Set status bar style to light
    open override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
    
    // Disable animation when hiding/showing status bar
    open override var preferredStatusBarUpdateAnimation: UIStatusBarAnimation {
        return .none
    }
}

extension CAPBridgeViewController {
    override var prefersStatusBarHidden: Bool {
        return true
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
} 