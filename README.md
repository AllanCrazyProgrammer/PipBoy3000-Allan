# PIP-BOY 3000

Personalización de Allan basada en el proyecto original
[9hm2/PipBoy3000](https://github.com/9hm2/PipBoy3000).

La rama principal conserva la versión **v1.2.1**. El APK listo para instalar
está incluido en `releases/PipBoy3000-Allan-v1.2.1.apk`.

A full Android **launcher** styled after the Fallout Pip-Boy. The UI is the real,
exported **Pip-Boy Design System** (HTML/CSS/JS) rendered inside a native WebView
and bridged to Android system features, so your home screen looks and behaves like
a Pip-Boy terminal.

When installed and selected as your Home app, PIP-BOY 3000 replaces the stock
launcher with a green-phosphor terminal that lists your apps, contacts, call
history, and live device readouts.

## Features

- **App drawer + launching** — browse every installed app as an "inventory" and
  launch any of them.
- **Call log** — recent incoming/outgoing/missed calls.
- **Contacts + dialing** — browse contacts and place calls.
- **Device stats** — battery, storage, RAM, and a live clock on the STAT tab.
- **Quick settings / flashlight** — fast toggles for common controls.

## Allan v1.2.1

- Android favorite contacts displayed in a two-column grid.
- Phone-number normalization prevents duplicate favorite contacts.
- Fallout-style navigation sounds and selectable Pip-Boy color themes.
- Tappable notification rows open their content or fall back to the source app.
- Android 14 background-launch handling for notification actions.

## Architecture

```
┌──────────────────────────────────────────────┐
│  MainActivity (Kotlin)                         │
│   • Hosts a full-screen WebView                │
│   • WebViewAssetLoader serves bundled assets/  │
│     over https://appassets.androidplatform.net │
│                                                │
│   window.AndroidBridge  ◄──── JS bridge ────►  │
│   (com.pipboy3000.launcher.bridge.LauncherBridge)
│                                                │
│  Web UI in assets/ (Pip-Boy Design System)     │
│   • window.PipBoy components render the tabs    │
│   • calls AndroidBridge for system data/actions │
└──────────────────────────────────────────────┘
```

- **WebView host:** `MainActivity` loads the local web UI and wires up the bridge.
- **Asset serving:** `WebViewAssetLoader` exposes everything under `app/src/main/assets/`
  to the page, avoiding `file://` restrictions.
- **JS bridge:** the web UI talks to Android through `window.AndroidBridge`, backed by
  `com.pipboy3000.launcher.bridge.LauncherBridge`, which reads apps/contacts/call log/
  device stats and performs actions (launch app, dial, toggle flashlight, etc.).
- **Web UI:** the exported Pip-Boy design renders via `window.PipBoy` components.

## Permissions

The launcher requests only what its surfaces need:

| Permission | Why |
| --- | --- |
| `QUERY_ALL_PACKAGES` | Build a complete app drawer ("inventory"). |
| `READ_CALL_LOG` | Show recent call history on the DATA tab. |
| `READ_CONTACTS` | List contacts for browsing and dialing. |
| `CALL_PHONE` | Place calls from the dialer. |
| `READ_PHONE_STATE` | Telephony/device state for stats and dialing. |
| `EXPAND_STATUS_BAR` | Quick-settings style controls. |
| `SET_WALLPAPER` | Launcher wallpaper integration. |
| `VIBRATE` | Tactile feedback for terminal interactions. |

## Build

**Prerequisites:** JDK 17 and the Android SDK (API 34).

```bash
./gradlew assembleDebug
```

APK output:

```
app/build/outputs/apk/debug/app-debug.apk
```

### Signing

The private signing keystore is intentionally **not included** in this public
repository. Local debug builds use the developer's local Android debug key.
Official update APKs must be signed with Allan's privately stored signing key.

## Continuous integration

The GitHub Actions workflow is **manual-only** (`workflow_dispatch`):

1. Open the **Actions** tab.
2. Select the **Build** workflow.
3. Click **Run workflow** (optionally choose `debug` or `release`).

When it finishes, download the APK from the run's **Artifacts** section
(`pipboy3000-debug-apk` / `pipboy3000-release-apk`). Release workflows should
receive signing credentials through protected repository secrets.

## Install

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

After installing, press Home (or open Settings → Apps → Default apps → Home app)
and choose **PIP-BOY 3000** as your launcher.

## Credits

UI built with the **Pip-Boy Design System**, exported from Claude Design.
