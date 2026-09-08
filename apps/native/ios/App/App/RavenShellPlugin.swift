import Foundation
import Capacitor
import WebKit

/// Shell plugin for the remote Raven pages (contract: packages/lib/utils/ravenShell.ts):
/// navigation gate and per-site cookie clearing. Share intents come from send-intent's
/// extension here, so the Android-only methods resolve as no-ops.
@objc(RavenShellPlugin)
public class RavenShellPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RavenShellPlugin"
    public let jsName = "RavenShell"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getShareIntent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearShareIntent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearSiteCookies", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "syncAllowedOrigins", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showNotification", returnType: CAPPluginReturnPromise),
    ]

    override public func load() {
        // Taps on notifications posted here route to the push handler, so the page
        // gets the same notificationActionPerformed event as for a push.
        bridge?.notificationRouter.localNotificationHandler = self
    }

    // MARK: - Foreground notifications

    // A foreground push is handed to the page (presentationOptions []); the page
    // re-posts the ones from another saved site through here.
    @objc func showNotification(_ call: CAPPluginCall) {
        let content = UNMutableNotificationContent()
        content.title = call.getString("title") ?? ""
        content.body = call.getString("body") ?? ""
        content.userInfo = call.getObject("data") ?? [:]
        content.sound = .default
        // A tagged post replaces the previous one for the same conversation.
        let request = UNNotificationRequest(identifier: call.getString("tag") ?? UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request) { _ in call.resolve() }
    }

    // MARK: - Navigation gate

    override public func shouldOverrideLoad(_ navigationAction: WKNavigationAction) -> NSNumber? {
        guard let url = navigationAction.request.url,
              let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https" else {
            return nil
        }
        // Embeds (sub-frames) keep Capacitor's default policy.
        if let frame = navigationAction.targetFrame, !frame.isMainFrame { return nil }
        if allowedOrigins().contains(Self.origin(of: url)) { return false }
        UIApplication.shared.open(url)
        return true
    }

    // Same form as URL.origin in the saved list: lowercased, default port dropped.
    private static func origin(of url: URL) -> String {
        let scheme = url.scheme?.lowercased() ?? ""
        let base = "\(scheme)://\(url.host?.lowercased() ?? "")"
        guard let port = url.port, !(scheme == "https" && port == 443), !(scheme == "http" && port == 80) else { return base }
        return "\(base):\(port)"
    }

    /// Saved sites, as written by apps/native/src/sites.ts through @capacitor/preferences.
    private func siteOrigins() -> Set<String> {
        var origins = Set<String>()
        guard let json = UserDefaults.standard.string(forKey: "CapacitorStorage.sites")?.data(using: .utf8),
              let sites = try? JSONSerialization.jsonObject(with: json) as? [[String: Any]] else {
            return origins
        }
        for site in sites {
            if let raw = site["url"] as? String, let url = URL(string: raw), url.scheme != nil, url.host != nil {
                origins.insert(Self.origin(of: url))
            }
        }
        return origins
    }

    private func allowedOrigins() -> Set<String> {
        var origins = siteOrigins()
        if let local = bridge?.config.localURL { origins.insert(Self.origin(of: local)) }
        if let server = bridge?.config.serverURL { origins.insert(Self.origin(of: server)) }
        return origins
    }

    // MARK: - Cookies

    @objc func clearSiteCookies(_ call: CAPPluginCall) {
        guard let raw = call.getString("url"), let url = URL(string: raw), let host = url.host?.lowercased() else {
            call.reject("url required")
            return
        }
        DispatchQueue.main.async { [weak self] in
            let store = (self?.webView?.configuration.websiteDataStore ?? WKWebsiteDataStore.default()).httpCookieStore
            store.getAllCookies { cookies in
                // Host-only cookies of a parent site (example.com vs chat.example.com) stay.
                let matching = cookies.filter { cookie in
                    let domain = cookie.domain.lowercased()
                    guard domain.hasPrefix(".") else { return domain == host }
                    let parent = String(domain.dropFirst())
                    return host == parent || host.hasSuffix("." + parent)
                }
                let group = DispatchGroup()
                for cookie in matching {
                    group.enter()
                    store.delete(cookie) { group.leave() }
                }
                group.notify(queue: .main) { call.resolve() }
            }
        }
    }

    // MARK: - Android-only surface

    @objc func getShareIntent(_ call: CAPPluginCall) {
        // iOS shares arrive through send-intent's share extension.
        call.resolve([:])
    }

    @objc func clearShareIntent(_ call: CAPPluginCall) {
        // send-intent marks a delivered share as processed itself.
        call.resolve()
    }

    @objc func syncAllowedOrigins(_ call: CAPPluginCall) {
        // The user script already runs on every origin; the gate above does the limiting.
        call.resolve()
    }
}

extension RavenShellPlugin: NotificationHandlerProtocol {
    public func willPresent(notification: UNNotification) -> UNNotificationPresentationOptions {
        [.banner, .list, .sound]
    }

    public func didReceive(response: UNNotificationResponse) {
        bridge?.notificationRouter.pushNotificationHandler?.didReceive(response: response)
    }
}
