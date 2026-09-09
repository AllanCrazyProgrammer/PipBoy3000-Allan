package com.pipboy3000.launcher.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import java.util.concurrent.Executors
import kotlin.math.PI
import kotlin.math.sin

/**
 * Small native lock/unlock cues. Native playback keeps working while the WebView
 * is paused during a screen transition. The preference mirrors INTERFACE SOUNDS.
 */
class ScreenSoundController(context: Context) {
    private val appContext = context.applicationContext
    private val executor = Executors.newSingleThreadExecutor()

    fun setEnabled(enabled: Boolean) {
        appContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_ENABLED, enabled)
            .apply()
    }

    fun playLock() = play(doubleArrayOf(520.0, 300.0), intArrayOf(55, 105))

    // Lower, longer notes cut through a phone speaker better than the old high chirp.
    fun playUnlock() = play(doubleArrayOf(280.0, 420.0, 620.0), intArrayOf(65, 65, 185))

    fun playVolumeUp() = play(doubleArrayOf(520.0, 780.0), intArrayOf(35, 55))

    fun playVolumeDown() = play(doubleArrayOf(620.0, 390.0), intArrayOf(35, 55))

    private fun isEnabled(): Boolean = appContext
        .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .getBoolean(KEY_ENABLED, true)

    private fun play(frequencies: DoubleArray, durationsMs: IntArray) {
        if (!isEnabled()) return
        executor.execute {
            var track: AudioTrack? = null
            try {
                val samples = synthesize(frequencies, durationsMs)
                val format = AudioFormat.Builder()
                    .setSampleRate(SAMPLE_RATE)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()
                val attributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
                track = AudioTrack(
                    attributes,
                    format,
                    samples.size * 2,
                    AudioTrack.MODE_STATIC,
                    AudioManager.AUDIO_SESSION_ID_GENERATE,
                )
                track.write(samples, 0, samples.size)
                track.setVolume(1f)
                track.play()
                // Wait for actual playback, including speaker wake-up latency.
                val deadline = android.os.SystemClock.elapsedRealtime() + 2000
                while (track.playbackHeadPosition < samples.size &&
                    android.os.SystemClock.elapsedRealtime() < deadline) {
                    Thread.sleep(15)
                }
                android.util.Log.d("PipScreenSound", "Played ${samples.size} samples; head=${track.playbackHeadPosition}")
                track.stop()
            } catch (e: Exception) {
                android.util.Log.w("PipScreenSound", "Screen cue failed", e)
            } finally {
                track?.release()
            }
        }
    }

    private fun synthesize(frequencies: DoubleArray, durationsMs: IntArray): ShortArray {
        val total = durationsMs.sumOf { it * SAMPLE_RATE / 1000 }
        val output = ShortArray(total)
        var cursor = 0
        frequencies.indices.forEach { note ->
            val count = durationsMs[note] * SAMPLE_RATE / 1000
            for (i in 0 until count) {
                val envelope = minOf(i / (SAMPLE_RATE * 0.006), (count - i) / (SAMPLE_RATE * 0.018), 1.0)
                val phase = 2.0 * PI * frequencies[note] * i / SAMPLE_RATE
                // A rounded square wave gives the sound a compact old-terminal character.
                val wave = 0.72 * sin(phase) + 0.28 * sin(phase * 3.0)
                output[cursor + i] = (wave * envelope * 0.52 * Short.MAX_VALUE).toInt().toShort()
            }
            cursor += count
        }
        return output
    }

    companion object {
        private const val PREFS = "pipboy_audio"
        private const val KEY_ENABLED = "interface_sounds_enabled"
        private const val SAMPLE_RATE = 44_100
    }
}
