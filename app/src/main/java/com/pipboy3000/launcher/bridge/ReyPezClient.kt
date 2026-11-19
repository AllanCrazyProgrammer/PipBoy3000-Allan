package com.pipboy3000.launcher.bridge

import android.app.Activity
import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.ConnectException
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.URL
import java.net.UnknownHostException
import java.net.URLEncoder

/**
 * Cliente de solo lectura para la app de Rey Pez.
 *
 * Lee el pedido del día y los saldos de clientes a través de la Cloud
 * Function `asistente` del proyecto `reypezapp-1ced2` — la misma API que
 * usa Rey para leer pedidos y cuentas. No hay ninguna ruta de escritura
 * aquí: este cliente solo hace GETs.
 *
 * La clave de la API la escribe Allan en Ajustes, en su propio teléfono.
 * Se guarda cifrada (EncryptedSharedPreferences, con fallback a
 * preferencias privadas si el keystore falla) y NUNCA se escribe en el
 * repo, en un log ni en el JSON que se devuelve a la UI web. Sin clave
 * no se hace ninguna llamada de red.
 *
 * Endpoints usados (todos GET):
 *   /pedidos/limpio?fecha=YYYY-MM-DD
 *   /pedidos/crudo?fecha=YYYY-MM-DD
 *   /cuentas?cliente=<clave>&fecha=YYYY-MM-DD   (404 = sin cuenta ese día)
 */
class ReyPezClient(private val activity: Activity) {

    companion object {
        private const val BASE_URL =
            "https://us-central1-reypezapp-1ced2.cloudfunctions.net/asistente"
        private const val PREFS_NAME = "rey_pez"
        private const val KEY_API_KEY = "api_key"
        private const val TIMEOUT_MS = 8000

        /** Clave del pedido limpio, nombre para mostrar. */
        private val CLIENTES_LIMPIO = listOf(
            "joselito" to "Joselito",
            "otilio" to "Otilio",
            "catarro" to "Catarro",
            "ozuna" to "Ozuna",
            "lorena" to "Lorena",
        )

        /** Clave de cuentas, nombre para mostrar. */
        private val CLIENTES_CUENTAS = listOf(
            "joselito" to "Joselito",
            "otilio" to "Otilio",
            "catarro" to "Catarro",
            "ozuna" to "Ozuna",
            "veronica" to "Verónica",
        )

        /** Clave del pedido crudo -> clave de cliente. "8a" es Joselito. */
        private val CLIENTES_CRUDO = listOf(
            "8a" to "joselito",
            "Otilio" to "otilio",
            "Catarro" to "catarro",
            "Ozuna" to "ozuna",
            "Veronica" to "veronica",
        )
    }

    // ------------------------------------------------------------------
    // Clave: solo en el teléfono, nunca en el repo ni en logs.
    // ------------------------------------------------------------------

    private fun prefs(): SharedPreferences {
        return try {
            val masterKey = MasterKey.Builder(activity)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            EncryptedSharedPreferences.create(
                activity,
                PREFS_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
            )
        } catch (e: Exception) {
            // Si el keystore no está disponible, las preferencias privadas
            // de la app siguen sin salir del teléfono.
            activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        }
    }

    fun hasApiKey(): Boolean {
        return try {
            !prefs().getString(KEY_API_KEY, null).isNullOrBlank()
        } catch (e: Exception) {
            false
        }
    }

    /** Guarda la clave (con espacios recortados). Vacía o muy larga: false. */
    fun setApiKey(key: String): Boolean {
        val clean = key.trim()
        if (clean.isEmpty() || clean.length > 500) return false
        return try {
            prefs().edit().putString(KEY_API_KEY, clean).apply()
            true
        } catch (e: Exception) {
            false
        }
    }

    fun clearApiKey(): Boolean {
        return try {
            prefs().edit().remove(KEY_API_KEY).apply()
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun apiKey(): String? {
        return try {
            prefs().getString(KEY_API_KEY, null)?.trim()?.takeIf { it.isNotEmpty() }
        } catch (e: Exception) {
            null
        }
    }

    // ------------------------------------------------------------------
    // Resumen del día: pedido limpio + crudo + saldos. Un solo llamado
    // desde la UI; por dentro son 7 GETs de solo lectura.
    // ------------------------------------------------------------------

    /**
     * Devuelve el resumen de [fecha] (YYYY-MM-DD) como JSON:
     * {"ok", "fecha", "fetchedAt",
     *  "limpio": {"exists", "taras", "kilos",
     *             "porCliente": [{"cliente","nombre","lineas","medidas":[]}]},
     *  "crudo": {"exists", "taras", "kilos",
     *            "porCliente": [{"cliente","taras"}]},
     *  "cuentas": [{"cliente","nombre","tieneCuenta",
     *               "totalDia"|null, "saldoAcumulado"|null,
     *               "totalGeneral"|null}]}
     * Con error: {"ok":false, "error":"SIN_CLAVE"|"SIN_INTERNET"|
     * "CLAVE_INVALIDA"|"TIMEOUT"|"ERROR_RED"|"FECHA_INVALIDA",
     * "fecha", "fetchedAt"}. Nunca lanza excepciones.
     */
    fun getResumen(fecha: String): String {
        val fetchedAt = System.currentTimeMillis()
        if (!fecha.matches(Regex("\\d{4}-\\d{2}-\\d{2}"))) {
            return errorJson("FECHA_INVALIDA", fecha, fetchedAt)
        }
        val key = apiKey() ?: return errorJson("SIN_CLAVE", fecha, fetchedAt)
        return try {
            val out = JSONObject()
                .put("ok", true)
                .put("fecha", fecha)
                .put("fetchedAt", fetchedAt)

            // Pedido limpio.
            when (val r = get("/pedidos/limpio?fecha=$fecha", key)) {
                is GetResult.Ok -> out.put("limpio", parseLimpio(r.body))
                is GetResult.NotFound -> out.put("limpio", JSONObject()
                    .put("exists", false).put("taras", 0).put("kilos", 0)
                    .put("porCliente", JSONArray()))
                is GetResult.Unauthorized -> return errorJson("CLAVE_INVALIDA", fecha, fetchedAt)
                is GetResult.Failed -> return errorJson(r.error, fecha, fetchedAt)
            }

            // Pedido crudo.
            when (val r = get("/pedidos/crudo?fecha=$fecha", key)) {
                is GetResult.Ok -> out.put("crudo", parseCrudo(r.body))
                is GetResult.NotFound -> out.put("crudo", JSONObject()
                    .put("exists", false).put("taras", 0).put("kilos", 0)
                    .put("porCliente", JSONArray()))
                is GetResult.Unauthorized -> return errorJson("CLAVE_INVALIDA", fecha, fetchedAt)
                is GetResult.Failed -> return errorJson(r.error, fecha, fetchedAt)
            }

            // Saldos por cliente (404 = sin cuenta ese día, no es error).
            val cuentas = JSONArray()
            for ((clave, nombre) in CLIENTES_CUENTAS) {
                val cuenta = JSONObject()
                    .put("cliente", clave)
                    .put("nombre", nombre)
                when (val r = get(
                    "/cuentas?cliente=${URLEncoder.encode(clave, "UTF-8")}&fecha=$fecha",
                    key,
                )) {
                    is GetResult.Ok -> {
                        val doc = r.body.optJSONArray("cuentas")?.optJSONObject(0)
                        if (doc == null) {
                            cuenta.put("tieneCuenta", false)
                        } else {
                            cuenta.put("tieneCuenta", true)
                            putNullableDouble(cuenta, "totalDia", doc, "totalDia")
                            putNullableDouble(cuenta, "saldoAcumulado", doc, "nuevoSaldoAcumulado")
                            putNullableDouble(cuenta, "totalGeneral", doc, "totalGeneral")
                        }
                    }
                    is GetResult.NotFound -> cuenta.put("tieneCuenta", false)
                    is GetResult.Unauthorized -> return errorJson("CLAVE_INVALIDA", fecha, fetchedAt)
                    is GetResult.Failed -> return errorJson(r.error, fecha, fetchedAt)
                }
                cuentas.put(cuenta)
            }
            out.put("cuentas", cuentas)
            out.toString()
        } catch (e: Exception) {
            errorJson("ERROR_RED", fecha, fetchedAt)
        }
    }

    // ------------------------------------------------------------------
    // Parseo (los kilos y montos vienen de la API, aquí no se inventa
    // ninguno: por cliente solo se cuentan líneas y medidas).
    // ------------------------------------------------------------------

    private fun parseLimpio(body: JSONObject): JSONObject {
        val out = JSONObject()
        val pedido = body.optJSONObject("pedido")
        out.put("exists", body.optBoolean("exists", pedido != null))
        val totales = body.optJSONObject("totales")
        out.put("taras", totales?.optInt("taras", 0) ?: 0)
        out.put("kilos", totales?.optDouble("kilos", 0.0) ?: 0.0)
        val porCliente = JSONArray()
        if (pedido != null) {
            for ((clave, nombre) in CLIENTES_LIMPIO) {
                val lineas = pedido.optJSONArray(clave) ?: continue
                val medidas = JSONArray()
                val vistas = LinkedHashSet<String>()
                for (i in 0 until lineas.length()) {
                    val medida = lineas.optJSONObject(i)?.optString("medida") ?: continue
                    if (medida.isNotEmpty() && vistas.add(medida)) medidas.put(medida)
                }
                porCliente.put(JSONObject()
                    .put("cliente", clave)
                    .put("nombre", nombre)
                    .put("lineas", lineas.length())
                    .put("medidas", medidas))
            }
        }
        out.put("porCliente", porCliente)
        return out
    }

    private fun parseCrudo(body: JSONObject): JSONObject {
        val out = JSONObject()
        val pedido = body.optJSONObject("pedido")
        out.put("exists", body.optBoolean("exists", pedido != null))
        val totales = body.optJSONObject("totales")
        out.put("taras", totales?.optInt("taras", 0) ?: 0)
        out.put("kilos", totales?.optDouble("kilos", 0.0) ?: 0.0)
        val porCliente = JSONArray()
        val pedidos = pedido?.optJSONObject("pedidos")
        if (pedidos != null) {
            for ((claveCrudo, claveCliente) in CLIENTES_CRUDO) {
                val porMedida = pedidos.optJSONObject(claveCrudo) ?: continue
                var taras = 0
                val keys = porMedida.keys()
                while (keys.hasNext()) {
                    taras += porMedida.optInt(keys.next(), 0)
                }
                porCliente.put(JSONObject()
                    .put("cliente", claveCliente)
                    .put("taras", taras))
            }
        }
        out.put("porCliente", porCliente)
        return out
    }

    private fun putNullableDouble(out: JSONObject, field: String, src: JSONObject, srcField: String) {
        if (src.has(srcField) && !src.isNull(srcField)) {
            out.put(field, src.optDouble(srcField))
        } else {
            out.put(field, JSONObject.NULL)
        }
    }

    // ------------------------------------------------------------------
    // HTTP: solo GET, sin seguir redirecciones, con Bearer.
    // ------------------------------------------------------------------

    private sealed interface GetResult {
        data class Ok(val body: JSONObject) : GetResult
        data object NotFound : GetResult
        data object Unauthorized : GetResult
        data class Failed(val error: String) : GetResult
    }

    private fun get(path: String, key: String): GetResult {
        var conn: HttpURLConnection? = null
        return try {
            conn = (URL(BASE_URL + path).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = TIMEOUT_MS
                readTimeout = TIMEOUT_MS
                instanceFollowRedirects = false
                setRequestProperty("Authorization", "Bearer $key")
                setRequestProperty("Accept", "application/json")
            }
            when (val code = conn.responseCode) {
                200 -> {
                    val text = conn.inputStream.bufferedReader().use { it.readText() }
                    GetResult.Ok(JSONObject(text))
                }
                404 -> GetResult.NotFound
                401, 403 -> GetResult.Unauthorized
                else -> GetResult.Failed("HTTP_$code")
            }
        } catch (e: SocketTimeoutException) {
            GetResult.Failed("TIMEOUT")
        } catch (e: UnknownHostException) {
            GetResult.Failed("SIN_INTERNET")
        } catch (e: ConnectException) {
            GetResult.Failed("SIN_INTERNET")
        } catch (e: IOException) {
            GetResult.Failed("ERROR_RED")
        } catch (e: Exception) {
            GetResult.Failed("ERROR_RED")
        } finally {
            try { conn?.disconnect() } catch (e: Exception) { /* ignore */ }
        }
    }

    private fun errorJson(error: String, fecha: String, fetchedAt: Long): String {
        return try {
            JSONObject()
                .put("ok", false)
                .put("error", error)
                .put("fecha", fecha)
                .put("fetchedAt", fetchedAt)
                .toString()
        } catch (e: Exception) {
            "{\"ok\":false,\"error\":\"ERROR_RED\"}"
        }
    }
}
