# @raven/native

Capacitor project for the Raven iOS and Android apps. The web content is a
native-mode build of `apps/web` (`VITE_NATIVE=1`, output `apps/web/dist-native`),
served from the app's own origin and working offline. Design:
`docs/superpowers/specs/2026-09-09-native-bundled-design.md`.

## Build & run

```bash
yarn native:build     # apps/web native build → apps/web/dist-native
yarn native:sync      # build + cap sync
yarn native:ios       # cap open → Xcode
yarn native:android   # cap open → Android Studio
cd apps/native && npx cap run android --target <avd>
cd apps/native && npx cap run ios --target <udid>
```

## Local files (gitignored)

- `android/app/google-services.json`, `ios/App/App/GoogleService-Info.plist`: Firebase.
- `android/local.properties`: SDK path.
- `capacitor.config.local.json`: dev overrides, e.g. `server.androidScheme: "http"` so
  the emulator can call a plain-http bench.

## Native sources

- Android: `MainActivity` (system-bar insets, theme canvas, launch-intent replay guard),
  `RavenApplication` (night mode, notification channel), `RavenShellPlugin`
  (foreground notifications, share intake), `ConversationNotification`.
- iOS: `RavenBridgeViewController` (plugin registration, canvas), `SceneDelegate`
  (theme, share extension handoff), `AppDelegate` (APNs token), `RavenShellPlugin`.

Layer 1 of the bundled design: the app boots to a placeholder from `apps/web`.
