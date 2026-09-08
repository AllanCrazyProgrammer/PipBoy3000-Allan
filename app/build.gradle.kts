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
        versionCode = 5
        versionName = "1.2.1"

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

    // Never commit Allan's private signing key to this public repository.
    // Local debug builds use Android's normal local debug keystore.
    signingConfigs {
        getByName("debug") {
            val optionalLocalKey = rootProject.file("debug.keystore")
            if (optionalLocalKey.exists()) {
                storeFile = optionalLocalKey
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
    // WebViewAssetLoader: serve bundled design assets over https://appassets/.
    implementation("androidx.webkit:webkit:1.11.0")
}
