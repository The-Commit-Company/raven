import UIKit
import Capacitor

// Root view controller of Main.storyboard.
class RavenBridgeViewController: CAPBridgeViewController {
    // App-local plugins are not in the generated plugin list; register by instance.
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(RavenShellPlugin())
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Installed PWAs get iOS's edge back-swipe; a WKWebView has to opt in.
        webView?.allowsBackForwardNavigationGestures = true

        // Theme-aware canvas behind the page (pre-load, overscroll, insets);
        // runs before first paint, so the config needs no static backgroundColor.
        let background = UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(red: 0x17 / 255.0, green: 0x17 / 255.0, blue: 0x17 / 255.0, alpha: 1)
                : .white
        }
        view.backgroundColor = background
        webView?.backgroundColor = background
        webView?.scrollView.backgroundColor = background
        webView?.underPageBackgroundColor = background
    }
}
