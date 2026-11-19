plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.pipboy3000.launcher"
    compileSdk = 34
    ndkVersion = "26.1.10909125"

    defaultConfig {
        applicationId = "com.pipboy3000.launcher"
        minSdk = 26
        targetSdk = 34
        testInstrumentationRunner = "com.pipboy3000.launcher.telephony.call.CallNotificationSmokeTest"
        versionCode = 7
        versionName = "1.4.0"

        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
        }
        externalNativeBuild {
            cmake {
                arguments += "-DANDROID_STL=none"
            }
        }
    }

    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.22.1"
        }
    }

    // Never commit Allan's private RELEASE signing key to this public
    // repository. The committed debug.keystore is different: es una clave
    // SOLO de debug, generada para CI, con las credenciales convencionales
    // de debug ("android"/"androiddebugkey"). Todos los Builds de CI firman
    // con ella, así que los APK de CI comparten firma y la actualización
    // in-app (v1.4.0) puede instalar encima sin desinstalar. Sin este
    // archivo cada runner genera su propio debug key y cada APK queda con
    // firma distinta ("conflicto con un paquete" al actualizar).
    // Local debug builds use Android's normal local debug keystore.
    signingConfigs {
        getByName("debug") {
            val optionalLocalKey = rootProject.file("debug.keystore")
            if (optionalLocalKey.exists()) {
                storeFile = optionalLocalKey
                storeType = "PKCS12"
                storePassword = System.getenv("PIPBOY_KEYSTORE_PASSWORD") ?: "android"
                keyAlias = System.getenv("PIPBOY_KEY_ALIAS") ?: "androiddebugkey"
                keyPassword = System.getenv("PIPBOY_KEY_PASSWORD") ?: "android"
            }
        }
    }

    buildTypes {
        getByName("debug") {
            signingConfig = signingConfigs.getByName("debug")
        }
        getByName("release") {
            isMinifyEnabled = false
            // Uses the local signing configuration; CI should provide the
            // private keystore securely rather than commit it.
            signingConfig = signingConfigs.getByName("debug")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.9.2")
    // EncryptedSharedPreferences: la clave de Rey Pez se guarda cifrada
    // en el teléfono (ver ReyPezClient.kt). Nunca va al repo.
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    // WebViewAssetLoader: serve bundled design assets over https://appassets/.
    implementation("androidx.webkit:webkit:1.11.0")
}
