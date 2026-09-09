import Foundation
import Capacitor

/// Shell plugin for the bundled Raven page (contract: packages/lib/utils/ravenShell.ts):
/// foreground notifications for other saved sites. Share intents come from send-intent's
/// extension here, so the Android-only methods resolve as no-ops.
@objc(RavenShellPlugin)
public class RavenShellPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RavenShellPlugin"
    public let jsName = "RavenShell"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getShareIntent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearShareIntent", returnType: CAPPluginReturnPromise),
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
        content.subtitle = call.getString("site") ?? ""
        content.body = call.getString("body") ?? ""
        content.userInfo = call.getObject("data") ?? [:]
        content.sound = .default
        // One thread per conversation, so iOS stacks its notifications together.
        if let tag = call.getString("tag") { content.threadIdentifier = tag }
        let identifier = call.getString("tag") ?? UUID().uuidString
        let post = {
            // A tagged post replaces the previous one for the same conversation.
            let request = UNNotificationRequest(identifier: identifier, content: content, trigger: nil)
            UNUserNotificationCenter.current().add(request) { _ in call.resolve() }
        }
        // Sender avatar as the attachment; a missing or slow image just leaves it out.
        guard let image = call.getString("image"), let url = URL(string: image) else { return post() }
        URLSession.shared.downloadTask(with: url) { location, _, _ in
            if let location = location {
                let file = FileManager.default.temporaryDirectory.appendingPathComponent("\(UUID().uuidString).\(url.pathExtension.isEmpty ? "jpg" : url.pathExtension)")
                try? FileManager.default.moveItem(at: location, to: file)
                if let attachment = try? UNNotificationAttachment(identifier: "avatar", url: file) { content.attachments = [attachment] }
            }
            post()
        }.resume()
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
}

extension RavenShellPlugin: NotificationHandlerProtocol {
    public func willPresent(notification: UNNotification) -> UNNotificationPresentationOptions {
        [.banner, .list, .sound]
    }

    public func didReceive(response: UNNotificationResponse) {
        bridge?.notificationRouter.pushNotificationHandler?.didReceive(response: response)
    }
}
