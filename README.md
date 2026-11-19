# PIP-BOY 3000

Personalización de Allan basada en el proyecto original
[9hm2/PipBoy3000](https://github.com/9hm2/PipBoy3000).

La rama principal conserva la versión **v1.4.0**. El APK listo para instalar
de v1.2.1 está incluido en `releases/PipBoy3000-Allan-v1.2.1.apk`; el de
v1.4.0 se genera con el workflow **Build** (Actions → Run workflow), y
desde v1.4.0 la app misma avisa y actualiza desde Ajustes.

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

## Allan v1.4.0

- **Actualización in-app:** Ajustes revisa el Release más reciente de
  GitHub y, si hay versión nueva, muestra ACTUALIZAR: descarga el APK y
  abre el instalador del sistema, sin bajar el APK a mano. El workflow
  Build escribe versionName y versionCode en el cuerpo del Release para
  que la app compare.
- **Firma compartida de CI:** el repo incluye `debug.keystore`, una clave
  SOLO de debug generada para CI (credenciales convencionales de debug).
  Todos los Builds firman con ella, así que los APK comparten firma y la
  actualización in-app instala encima. Sin ella cada runner firmaba con
  su propia clave y Android rechazaba el APK ("conflicto con un
  paquete"). La clave privada de release de Allan nunca va al repo.

## Allan v1.3.0

- Android favorite contacts displayed in a two-column grid.
- Phone-number normalization prevents duplicate favorite contacts.
- Fallout-style navigation sounds and selectable Pip-Boy color themes.
- Tappable notification rows open their content or fall back to the source app.
- Android 14 background-launch handling for notification actions.
- **Rey Pez (solo lectura):** la pantalla INICIO muestra el pedido limpio
  y crudo del día y los saldos de Joselito, Otilio, Catarro, Ozuna y
  Verónica, leídos de la API del asistente de Rey Pez. Detalle en
  [Rey Pez](#rey-pez-solo-lectura).

## Rey Pez (solo lectura)

El launcher lee, nunca escribe. En INICIO aparece la sección
**REY PEZ — HOY** con el pedido limpio (taras y kilos totales, líneas y
medidas por cliente), el pedido crudo (taras y kilos, por cliente) y los
saldos (total del día y saldo acumulado; "sin cuenta hoy" cuando el
cliente aún no tiene cuenta ese día). Se actualiza al entrar a INICIO,
con caché de 5 minutos, y tiene botón ACTUALIZAR.

**Clave:** la API exige la clave del asistente (`ASISTENTE_API_KEY`).
Allan la pega en **Ajustes → REY PEZ → GUARDAR CLAVE**, en su propio
teléfono. Se guarda cifrada en el teléfono
(`EncryptedSharedPreferences`) y **nunca** va al repo, a un log ni a la
UI web. Sin clave, la sección solo muestra el aviso y el botón a
Ajustes. La clave de Allan está en Secret Manager del proyecto
`reypezapp-1ced2`, secreto `ASISTENTE_API_KEY`.

**Cómo funciona por dentro:** el puente nativo (`ReyPezClient.kt`)
hace los GETs con `HttpURLConnection` — `GET /pedidos/limpio`,
`GET /pedidos/crudo` y `GET /cuentas` por cliente — y devuelve un solo
JSON resumido a la UI. La UI web nunca ve la clave ni llama a la API
directo. Requiere internet: el manifiesto declara `INTERNET` (permiso
normal, sin diálogo).

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
