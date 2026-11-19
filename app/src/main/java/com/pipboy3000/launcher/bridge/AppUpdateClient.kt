package com.pipboy3000.launcher.bridge

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.widget.Toast
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/**
 * Actualización in-app desde los Releases de GitHub (v1.4.0).
 *
 * La app revisa el Release más reciente del repo
 * AllanCrazyProgrammer/PipBoy3000-Allan (el workflow Build publica uno
 * por corrida, con versionName y versionCode en el cuerpo). Si el
 * versionCode del Release es mayor que el instalado, Ajustes muestra el
 * botón ACTUALIZAR: el APK se descarga y se abre el instalador del
 * sistema. Nada de esto toca Rey Pez ni la clave del asistente.
 *
 * Para que la actualización pueda instalar encima, todos los Builds de
 * CI firman con el mismo debug.keystore del repo (ver build.gradle.kts).
 * Sin esa firma compartida Android rechaza el APK con "conflicto con un
 * paquete" y habría que desinstalar primero.
 *
 * Solo lectura de red + descarga del APK oficial del propio repo. Nunca
 * se ejecuta código descargado fuera del instalador del sistema, que es
 * quien verifica e instala.
 */
class AppUpdateClient(private val activity: Activity) {

    companion object {
        private const val RELEASES_LATEST_URL =
            "https://api.github.com/repos/AllanCrazyProgrammer/PipBoy3000-Allan/releases/latest"
        private const val TIMEOUT_MS = 10000
        private const val APK_FILE_NAME = "pipboy-update.apk"
        private const val MIN_APK_BYTES = 100_000L
    }

    /** {"versionCode":7,"versionName":"1.4.0"} de esta instalación. */
    fun getAppVersion(): String {
        return try {
            val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                activity.packageManager.getPackageInfo(
                    activity.packageName,
                    PackageManager.PackageInfoFlags.of(0),
                )
            } else {
                @Suppress("DEPRECATION")
                activity.packageManager.getPackageInfo(activity.packageName, 0)
            }
            val code = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                info.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                info.versionCode.toLong()
            }
            JSONObject()
                .put("versionCode", code)
                .put("versionName", info.versionName ?: "")
                .toString()
        } catch (e: Exception) {
            "{\"versionCode\":0,\"versionName\":\"\"}"
        }
    }

    /**
     * Revisa el Release más reciente. Devuelve JSON:
     * {"ok":true,"available":bool,"currentVersionCode":N,"currentVersionName":"..",
     *  "latestVersionCode":N,"latestVersionName":"..","apkUrl":"..","notes":".."}
     * Con error: {"ok":false,"error":"SIN_INTERNET"|"ERROR_RED"|"SIN_VERSION"}.
     */
    fun checkUpdate(): String {
        val current = try {
            JSONObject(getAppVersion())
        } catch (e: Exception) {
            JSONObject()
        }
        val currentCode = current.optLong("versionCode", 0)
        val currentName = current.optString("versionName", "")
        return try {
            val conn = (URL(RELEASES_LATEST_URL).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = TIMEOUT_MS
                readTimeout = TIMEOUT_MS
                instanceFollowRedirects = false
                setRequestProperty("Accept", "application/vnd.github+json")
                setRequestProperty("User-Agent", "PipBoy3000-Updater")
            }
            val code = conn.responseCode
            if (code != HttpURLConnection.HTTP_OK) {
                return errorJson("ERROR_RED", currentCode, currentName)
            }
            val text = conn.inputStream.bufferedReader().use { it.readText() }
            val release = JSONObject(text)
            val body = release.optString("body", "")
            val name = release.optString("name", "")
            val latestCode = Regex("versionCode:\\s*(\\d+)").find(body)
                ?.groupValues?.getOrNull(1)?.toLongOrNull() ?: 0L
            val latestName = Regex("versionName:\\s*([0-9]+\\.[0-9]+\\.[0-9]+)").find(body)
                ?.groupValues?.getOrNull(1)
                ?: Regex("v([0-9]+\\.[0-9]+\\.[0-9]+)").find(name)
                    ?.groupValues?.getOrNull(1)
                ?: ""
            var apkUrl = ""
            val assets = release.optJSONArray("assets")
            if (assets != null) {
                for (i in 0 until assets.length()) {
                    val assetName = assets.optJSONObject(i)?.optString("name", "") ?: ""
                    if (assetName.endsWith(".apk")) {
                        apkUrl = assets.optJSONObject(i)?.optString("browser_download_url", "") ?: ""
                        break
                    }
                }
            }
            if (latestCode <= 0 || latestName.isEmpty() || apkUrl.isEmpty()) {
                return errorJson("SIN_VERSION", currentCode, currentName)
            }
            JSONObject()
                .put("ok", true)
                .put("available", latestCode > currentCode)
                .put("currentVersionCode", currentCode)
                .put("currentVersionName", currentName)
                .put("latestVersionCode", latestCode)
                .put("latestVersionName", latestName)
                .put("apkUrl", apkUrl)
                .put("notes", body)
                .toString()
        } catch (e: java.net.UnknownHostException) {
            errorJson("SIN_INTERNET", currentCode, currentName)
        } catch (e: java.net.SocketTimeoutException) {
            errorJson("TIMEOUT", currentCode, currentName)
        } catch (e: Exception) {
            errorJson("ERROR_RED", currentCode, currentName)
        }
    }

    private fun errorJson(error: String, currentCode: Long, currentName: String): String {
        return try {
            JSONObject()
                .put("ok", false)
                .put("error", error)
                .put("currentVersionCode", currentCode)
                .put("currentVersionName", currentName)
                .toString()
        } catch (e: Exception) {
            "{\"ok\":false,\"error\":\"ERROR_RED\"}"
        }
    }

    /** ¿Puede esta app pedir instalar APKs (permiso "instalar apps desconocidas")? */
    fun canInstallPackages(): Boolean {
        return try {
            activity.packageManager.canRequestPackageInstalls()
        } catch (e: Exception) {
            false
        }
    }

    /** Abre el ajuste del sistema para permitir instalar apps desconocidas. */
    fun openInstallPermissionSettings(): Boolean {
        return try {
            val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES)
                .setData(Uri.parse("package:${activity.packageName}"))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            activity.startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Descarga el APK en un hilo y abre el instalador del sistema al
     * terminar. No bloquea a la UI: devuelve true de inmediato si la
     * descarga arrancó. Si algo falla, avisa con un Toast.
     */
    fun startUpdate(apkUrl: String): Boolean {
        if (apkUrl.isBlank()) return false
        Thread {
            try {
                val dir = File(activity.cacheDir, "update").apply { mkdirs() }
                val out = File(dir, APK_FILE_NAME)
                val conn = (URL(apkUrl).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = TIMEOUT_MS
                    readTimeout = 60_000
                    instanceFollowRedirects = true
                    setRequestProperty("User-Agent", "PipBoy3000-Updater")
                }
                if (conn.responseCode != HttpURLConnection.HTTP_OK) {
                    throw IOException("HTTP ${conn.responseCode}")
                }
                conn.inputStream.use { input ->
                    FileOutputStream(out).use { output ->
                        input.copyTo(output)
                    }
                }
                if (!out.exists() || out.length() < MIN_APK_BYTES) {
                    throw IOException("APK incompleto")
                }
                val uri = FileProvider.getUriForFile(
                    activity,
                    "${activity.packageName}.fileprovider",
                    out,
                )
                val intent = Intent(Intent.ACTION_VIEW)
                    .setDataAndType(uri, "application/vnd.android.package-archive")
                    .addFlags(
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_GRANT_READ_URI_PERMISSION,
                    )
                activity.startActivity(intent)
            } catch (e: Exception) {
                activity.runOnUiThread {
                    Toast.makeText(
                        activity,
                        "No se pudo descargar la actualización",
                        Toast.LENGTH_LONG,
                    ).show()
                }
            }
        }.start()
        return true
    }
}
