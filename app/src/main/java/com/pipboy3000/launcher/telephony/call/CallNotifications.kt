package com.pipboy3000.launcher.telephony.call

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.telecom.Call
import android.telecom.VideoProfile
import android.util.Log
import androidx.core.app.NotificationCompat
import com.pipboy3000.launcher.MainActivity
import com.pipboy3000.launcher.R
import java.util.UUID

/** Native controls stay available even when the launcher WebView is in the background. */
object CallNotifications {
    private const val CHANNEL = "pipboy_calls"
    private const val TAG = "PipBoyCalls"
    private const val NOTIFICATION_ID = 1
    private data class Entry(val call: Call, val callback: Call.Callback)
    // Each notification/action targets one specific call, never a later replacement.
    private val entries = mutableMapOf<String, Entry>()

    fun add(context: Context, call: Call) {
        if (entries.values.any { it.call === call }) return
        val app = context.applicationContext
        val token = UUID.randomUUID().toString()
        val callback = object : Call.Callback() {
            override fun onStateChanged(call: Call, state: Int) { update(app, token) }
            override fun onDetailsChanged(call: Call, details: Call.Details) { update(app, token) }
        }
        entries[token] = Entry(call, callback)
        call.registerCallback(callback, Handler(Looper.getMainLooper()))
        update(app, token)
    }

    fun remove(context: Context, call: Call) {
        entries.filterValues { it.call === call }.keys.toList().forEach { token ->
            entries.remove(token)?.let { it.call.unregisterCallback(it.callback) }
            context.getSystemService(NotificationManager::class.java).cancel(token, NOTIFICATION_ID)
        }
    }

    fun clear(context: Context) {
        entries.values.map { it.call }.toList().forEach { remove(context, it) }
    }

    fun refresh(context: Context) {
        entries.keys.toList().forEach { update(context, it) }
    }

    fun act(context: Context, token: String?, action: String?) {
        val call = entries[token]?.call ?: return
        try {
            when (action) {
                "hangup" -> if (call.state != Call.STATE_DISCONNECTED && call.state != Call.STATE_DISCONNECTING) {
                    if (call.state == Call.STATE_RINGING) call.reject(false, null) else call.disconnect()
                }
                "answer" -> if (call.state == Call.STATE_RINGING) call.answer(VideoProfile.STATE_AUDIO_ONLY)
            }
            token?.let { update(context, it) }
        } catch (e: Exception) {
            Log.w(TAG, "Could not perform call notification action", e)
        }
    }

    private fun action(context: Context, token: String, action: String): PendingIntent =
        PendingIntent.getBroadcast(context, 0,
            Intent(context, CallActionReceiver::class.java)
                .setAction(action)
                .setData(Uri.parse("pipboy-call://$token/$action"))
                .putExtra("callToken", token),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

    private fun update(context: Context, token: String) {
        val call = entries[token]?.call ?: return
        val manager = context.getSystemService(NotificationManager::class.java)
        try {
            if (call.state == Call.STATE_DISCONNECTED || call.state == Call.STATE_DISCONNECTING) {
                manager.cancel(token, NOTIFICATION_ID)
                return
            }
            if (Build.VERSION.SDK_INT >= 33 &&
                context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
            val number = call.details?.handle?.schemeSpecificPart.orEmpty()
            val label = call.details?.callerDisplayName?.takeIf { it.isNotBlank() }
                ?: number.ifBlank { "Número privado" }
            manager.notify(token, NOTIFICATION_ID, buildNotification(context, token, label,
                call.state, call.details?.connectTimeMillis ?: 0L))
        } catch (e: Exception) {
            Log.w(TAG, "Could not update call notification", e)
        }
    }
    /** Ordinary actionable notifications also work on devices that reject CallStyle
     * outside a foreground service. The bound InCallService owns their lifetime. */
    internal fun buildNotification(context: Context, token: String, label: String,
        state: Int, connected: Long): Notification {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(CHANNEL, "Llamadas", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Controles para contestar y colgar llamadas"
            setSound(null, null) // Android Telecom owns the ringtone.
            enableVibration(false)
        })
        val status = when (state) {
            Call.STATE_RINGING -> "Llamada entrante"
            Call.STATE_DIALING, Call.STATE_CONNECTING -> "Llamando…"
            Call.STATE_HOLDING -> "Llamada en espera"
            else -> "Llamada en curso"
        }
        val open = PendingIntent.getActivity(context, 0,
            Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val builder = NotificationCompat.Builder(context, CHANNEL)
            .setSmallIcon(R.drawable.ic_call_notification)
            .setContentTitle(status)
            .setContentText(label)
            .setStyle(NotificationCompat.BigTextStyle().bigText(label + "\nDespliega esta notificación para ver los controles."))
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(open)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .addAction(R.drawable.ic_call_notification,
                if (state == Call.STATE_RINGING) "RECHAZAR" else "COLGAR", action(context, token, "hangup"))
        if (state == Call.STATE_RINGING) {
            builder.addAction(R.drawable.ic_call_notification, "CONTESTAR", action(context, token, "answer"))
        }
        if (connected > 0L && state == Call.STATE_ACTIVE) {
            builder.setWhen(connected).setUsesChronometer(true)
        } else builder.setShowWhen(false)
        return builder.build()
    }

}

/** Explicit, non-exported receiver: the notification can hang up without opening an activity. */
class CallActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        CallNotifications.act(context, intent.getStringExtra("callToken"), intent.action)
    }
}
