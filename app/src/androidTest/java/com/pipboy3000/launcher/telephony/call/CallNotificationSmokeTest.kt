package com.pipboy3000.launcher.telephony.call

import android.app.Activity
import android.app.Instrumentation
import android.app.Notification
import android.app.NotificationManager
import android.os.Bundle
import android.telecom.Call

/** Posts through the actual device notification manager; never places or ends a real call. */
class CallNotificationSmokeTest : Instrumentation() {
    override fun onCreate(arguments: Bundle?) {
        super.onCreate(arguments)
        start()
    }

    override fun onStart() {
        val manager = targetContext.getSystemService(NotificationManager::class.java)
        val tag = "pipboy-notification-test"
        val result = Bundle()
        try {
            for (state in listOf(Call.STATE_DIALING, Call.STATE_ACTIVE, Call.STATE_HOLDING, Call.STATE_RINGING)) {
                val notification = CallNotifications.buildNotification(targetContext, tag,
                    "PRUEBA DE CONTROLES · sin llamada real", state, System.currentTimeMillis())
                manager.notify(tag, 9876, notification)
                var posted = false
                repeat(20) {
                    if (manager.activeNotifications.any { it.tag == tag && it.id == 9876 }) posted = true
                    if (!posted) Thread.sleep(100)
                }
                check(posted) { "Notification rejected for call state $state" }
                check(notification.flags and Notification.FLAG_ONGOING_EVENT != 0)
                val labels = notification.actions.map { it.title.toString() }
                check(if (state == Call.STATE_RINGING) labels == listOf("RECHAZAR", "CONTESTAR") else labels == listOf("COLGAR"))
                // A stale/unknown token must never control a different call.
                notification.actions.first().actionIntent.send()
            }
            manager.cancel(tag, 9876)
            result.putString("stream", "PASS: actual device accepted dialing, active, held and incoming notifications with the expected controls; unknown-token actions are safe.\n")
            finish(Activity.RESULT_OK, result)
        } catch (e: Throwable) {
            manager.cancel(tag, 9876)
            result.putString("stream", "FAIL: $e\n")
            finish(Activity.RESULT_CANCELED, result)
        }
    }
}
