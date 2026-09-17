import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Download,
  Copy,
  Check,
  Smartphone,
  Layers,
  ChevronRight,
} from 'lucide-react';
import JSZip from 'jszip';

interface FileNode {
  path: string;
  name: string;
  language: string;
  content: string;
}

export const AndroidCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Native files catalog
  const files: FileNode[] = [
    {
      path: 'app/src/main/java/com/dailywallpapers/app/MainActivity.kt',
      name: 'MainActivity.kt',
      language: 'kotlin',
      content: `package com.dailywallpapers.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.dailywallpapers.app.admob.RewardedAdManager
import com.dailywallpapers.app.ui.DailyWallpapersApp
import com.dailywallpapers.app.ui.theme.DailyWallpapersTheme
import com.google.android.gms.ads.MobileAds

class MainActivity : ComponentActivity() {

    lateinit var rewardedAdManager: RewardedAdManager
        private set

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        // Initialize Google Mobile Ads SDK
        MobileAds.initialize(this) {}

        // Prepare Rewarded Ad Manager
        rewardedAdManager = RewardedAdManager(this)
        rewardedAdManager.loadAd()

        setContent {
            DailyWallpapersTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DailyWallpapersApp(
                        activity = this,
                        rewardedAdManager = rewardedAdManager
                    )
                }
            }
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/dailywallpapers/app/admob/RewardedAdManager.kt',
      name: 'RewardedAdManager.kt',
      language: 'kotlin',
      content: `package com.dailywallpapers.app.admob

import android.app.Activity
import android.content.Context
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

class RewardedAdManager(private val context: Context) {

    private var rewardedAd: RewardedAd? = null
    private var isLoading = false

    // Google Test Rewarded Ad Unit ID
    val adUnitId = "ca-app-pub-3940256099942544/5224354917"

    fun loadAd(onLoaded: (() -> Unit)? = null, onError: ((String) -> Unit)? = null) {
        if (rewardedAd != null) {
            onLoaded?.invoke()
            return
        }

        if (isLoading) return
        isLoading = true

        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(
            context,
            adUnitId,
            adRequest,
            object : RewardedAdLoadCallback() {
                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    isLoading = false
                    rewardedAd = null
                    onError?.invoke(loadAdError.message)
                }

                override fun onAdLoaded(ad: RewardedAd) {
                    isLoading = false
                    rewardedAd = ad
                    onLoaded?.invoke()
                }
            }
        )
    }

    /**
     * Shows rewarded ad.
     * The reward callback is ONLY triggered if user watches the entire ad.
     * Closing before completion triggers onAdDismissedWithoutReward.
     */
    fun showAd(
        activity: Activity,
        onRewardEarned: () -> Unit,
        onAdDismissedWithoutReward: () -> Unit,
        onError: (String) -> Unit
    ) {
        val ad = rewardedAd
        if (ad == null) {
            onError("The ad isn't available right now. Please try again.")
            loadAd()
            return
        }

        var rewardGranted = false

        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                rewardedAd = null
                loadAd()
                if (!rewardGranted) {
                    onAdDismissedWithoutReward()
                }
            }

            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                rewardedAd = null
                loadAd()
                onError(adError.message)
            }
        }

        ad.show(activity) { rewardItem ->
            rewardGranted = true
            onRewardEarned()
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/dailywallpapers/app/wallpaper/WallpaperManagerHelper.kt',
      name: 'WallpaperManagerHelper.kt',
      language: 'kotlin',
      content: `package com.dailywallpapers.app.wallpaper

import android.app.WallpaperManager
import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

enum class WallpaperTarget {
    HOME,
    LOCK,
    BOTH
}

class WallpaperManagerHelper(private val context: Context) {

    private val wallpaperManager = WallpaperManager.getInstance(context)

    suspend fun downloadBitmap(imageUrl: String): Bitmap? = withContext(Dispatchers.IO) {
        try {
            val url = URL(imageUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.doInput = true
            connection.connect()
            val input: InputStream = connection.inputStream
            BitmapFactory.decodeStream(input)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun setWallpaper(bitmap: Bitmap, target: WallpaperTarget): Boolean = withContext(Dispatchers.IO) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                when (target) {
                    WallpaperTarget.HOME -> wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM)
                    WallpaperTarget.LOCK -> wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK)
                    WallpaperTarget.BOTH -> wallpaperManager.setBitmap(bitmap, null, true, WallpaperManager.FLAG_SYSTEM or WallpaperManager.FLAG_LOCK)
                }
            } else {
                wallpaperManager.setBitmap(bitmap)
            }
            true
        } catch (e: Exception) {
            false
        }
    }
}`,
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      name: 'AndroidManifest.xml',
      language: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.dailywallpapers.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.SET_WALLPAPER" />

    <application
        android:allowBackup="true"
        android:label="Daily Wallpapers"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">

        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713" />

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    {
      path: 'app/build.gradle.kts',
      name: 'build.gradle.kts (app)',
      language: 'kotlin',
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.dailywallpapers.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.dailywallpapers.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        buildConfigField("String", "ADMOB_REWARDED_AD_UNIT_ID", "\\"ca-app-pub-3940256099942544/5224354917\\"")
    }

    buildFeatures {
        compose = true
        buildConfig = true
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
    implementation(platform("androidx.compose:compose-bom:2025.02.00"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("io.coil-kt:coil-compose:2.7.0")
    implementation("com.google.android.gms:play-services-ads:23.6.0")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
}`,
    },
    {
      path: 'settings.gradle.kts',
      name: 'settings.gradle.kts (Project)',
      language: 'kotlin',
      content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "DailyWallpapers"
include(":app")`,
    },
    {
      path: 'build.gradle.kts',
      name: 'build.gradle.kts (Project Root)',
      language: 'kotlin',
      content: `// Top-level build file for Daily Wallpapers Android project
plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}`,
    },
    {
      path: 'gradle.properties',
      name: 'gradle.properties',
      language: 'properties',
      content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true`,
    },
    {
      path: 'gradle/wrapper/gradle-wrapper.properties',
      name: 'gradle-wrapper.properties',
      language: 'properties',
      content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
    },
    {
      path: 'app/src/main/java/com/dailywallpapers/app/data/model/Wallpaper.kt',
      name: 'Wallpaper.kt',
      language: 'kotlin',
      content: `package com.dailywallpapers.app.data.model

import com.google.gson.annotations.SerializedName

data class Wallpaper(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("category_id") val categoryId: String,
    @SerializedName("category_name") val categoryName: String? = null,
    @SerializedName("original_url") val originalUrl: String,
    @SerializedName("thumbnail_url") val thumbnailUrl: String,
    @SerializedName("medium_url") val mediumUrl: String,
    @SerializedName("full_url") val fullUrl: String,
    @SerializedName("width") val width: Int,
    @SerializedName("height") val height: Int,
    @SerializedName("aspect_ratio") val aspectRatio: String? = null,
    @SerializedName("file_size") val fileSize: Long,
    @SerializedName("is_featured") val isFeatured: Boolean,
    @SerializedName("is_daily") val isDaily: Boolean,
    @SerializedName("publish_date") val publishDate: String,
    @SerializedName("downloads") val downloads: Int,
    @SerializedName("views") val views: Int,
    @SerializedName("created_at") val createdAt: String
)

data class Category(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("slug") val slug: String,
    @SerializedName("image_url") val imageUrl: String,
    @SerializedName("wallpaper_count") val wallpaperCount: Int? = 0
)

data class WallpaperResponse<T>(
    @SerializedName("data") val data: T,
    @SerializedName("status") val status: String
)`,
    },
    {
      path: 'app/src/main/java/com/dailywallpapers/app/data/api/WallpaperApiService.kt',
      name: 'WallpaperApiService.kt',
      language: 'kotlin',
      content: `package com.dailywallpapers.app.data.api

import com.dailywallpapers.app.data.model.Category
import com.dailywallpapers.app.data.model.Wallpaper
import com.dailywallpapers.app.data.model.WallpaperResponse
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface WallpaperApiService {

    @GET("api/wallpapers")
    suspend fun getWallpapers(
        @Query("category") category: String? = null
    ): WallpaperResponse<List<Wallpaper>>

    @GET("api/wallpapers/daily")
    suspend fun getDailyWallpapers(): WallpaperResponse<List<Wallpaper>>

    @GET("api/wallpapers/featured")
    suspend fun getFeaturedWallpapers(): WallpaperResponse<List<Wallpaper>>

    @GET("api/wallpapers/{id}")
    suspend fun getWallpaperDetail(
        @Path("id") id: String
    ): WallpaperResponse<Wallpaper>

    @GET("api/categories")
    suspend fun getCategories(): WallpaperResponse<List<Category>>

    @GET("api/categories/{slug}/wallpapers")
    suspend fun getCategoryWallpapers(
        @Path("slug") slug: String
    ): WallpaperResponse<List<Wallpaper>>

    @POST("api/wallpapers/{id}/view")
    suspend fun recordView(@Path("id") id: String): Map<String, Any>

    @POST("api/wallpapers/{id}/download")
    suspend fun recordDownload(@Path("id") id: String): Map<String, Any>
}`,
    },
    {
      path: 'app/src/main/java/com/dailywallpapers/app/ui/DailyWallpapersApp.kt',
      name: 'DailyWallpapersApp.kt',
      language: 'kotlin',
      content: `package com.dailywallpapers.app.ui

import android.app.Activity
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dailywallpapers.app.admob.RewardedAdManager

enum class ScreenTab(val title: String) {
    HOME("Home"),
    EXPLORE("Explore"),
    FAVORITES("Favorites"),
    SETTINGS("Settings")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DailyWallpapersApp(
    activity: Activity,
    rewardedAdManager: RewardedAdManager
) {
    var selectedTab by remember { mutableStateOf(ScreenTab.HOME) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 4.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == ScreenTab.HOME,
                    onClick = { selectedTab = ScreenTab.HOME },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = selectedTab == ScreenTab.EXPLORE,
                    onClick = { selectedTab = ScreenTab.EXPLORE },
                    icon = { Icon(Icons.Default.Search, contentDescription = "Explore") },
                    label = { Text("Explore") }
                )
                NavigationBarItem(
                    selected = selectedTab == ScreenTab.FAVORITES,
                    onClick = { selectedTab = ScreenTab.FAVORITES },
                    icon = { Icon(Icons.Default.Favorite, contentDescription = "Favorites") },
                    label = { Text("Favorites") }
                )
                NavigationBarItem(
                    selected = selectedTab == ScreenTab.SETTINGS,
                    onClick = { selectedTab = ScreenTab.SETTINGS },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings") }
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when (selectedTab) {
                ScreenTab.HOME -> {
                    Column(modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Daily Wallpapers",
                            style = MaterialTheme.typography.headlineMedium,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = "Today's Wallpapers",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "A new wallpaper every day. Discover, preview, and apply.",
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                ScreenTab.EXPLORE -> {
                    Text("Explore Categories & Search", modifier = Modifier.padding(16.dp))
                }
                ScreenTab.FAVORITES -> {
                    Text("Save wallpapers you love and they will appear here.", modifier = Modifier.padding(16.dp))
                }
                ScreenTab.SETTINGS -> {
                    Text("Settings & Preferences", modifier = Modifier.padding(16.dp))
                }
            }
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/dailywallpapers/app/ui/theme/Theme.kt',
      name: 'Theme.kt',
      language: 'kotlin',
      content: `package com.dailywallpapers.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val LightBackground = Color(0xFFFAFAF8)
val LightSurface = Color(0xFFFFFFFF)
val TextPrimary = Color(0xFF171717)
val TextSecondary = Color(0xFF737373)
val AccentColor = Color(0xFF6C63FF)

val DarkBackground = Color(0xFF121212)
val DarkSurface = Color(0xFF1E1E1E)
val DarkTextPrimary = Color(0xFFE5E5E5)
val DarkTextSecondary = Color(0xFFA3A3A3)

private val LightColorScheme = lightColorScheme(
    primary = AccentColor,
    background = LightBackground,
    surface = LightSurface,
    onPrimary = Color.White,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    onSurfaceVariant = TextSecondary
)

private val DarkColorScheme = darkColorScheme(
    primary = AccentColor,
    background = DarkBackground,
    surface = DarkSurface,
    onPrimary = Color.White,
    onBackground = DarkTextPrimary,
    onSurface = DarkTextPrimary,
    onSurfaceVariant = DarkTextSecondary
)

@Composable
fun DailyWallpapersTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}`,
    },
  ];

  const [selectedFile, setSelectedFile] = useState<FileNode>(files[0]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      files.forEach((f) => {
        zip.file(`DailyWallpapers/${f.path}`, f.content);
      });
      zip.file('DailyWallpapers/README.md', '# Daily Wallpapers Android Native Project\nBuilt with Kotlin & Jetpack Compose');

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'daily-wallpapers-android.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-xl font-bold text-[#171717]">
              Native Android Codebase
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Kotlin 2.1, Jetpack Compose, Material 3, Android WallpaperManager & AdMob Rewarded Ads
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="px-4 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#584ee8] disabled:opacity-60 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4" />
          {downloadingZip ? 'Packaging ZIP...' : 'Download Android Project (ZIP)'}
        </button>
      </div>

      {/* Explorer + Code View Container */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[540px]">
        {/* Left Sidebar: File Tree */}
        <div className="p-4 bg-neutral-50 border-r border-neutral-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 uppercase tracking-wider">
            <Folder className="w-4 h-4 text-neutral-400" />
            Project Tree
          </div>

          <div className="space-y-1">
            {files.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-white text-[#6C63FF] shadow-xs border border-neutral-200/80'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-4 h-4 shrink-0 text-neutral-400" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-neutral-100/80 rounded-xl text-[11px] text-neutral-600 leading-relaxed mt-4">
            <strong>Ready for Android Studio:</strong> Open the exported folder directly in Android Studio Ladybug or newer.
          </div>
        </div>

        {/* Right Code Display */}
        <div className="md:col-span-2 flex flex-col bg-neutral-950 text-neutral-200 font-mono text-xs">
          {/* Top Code Header */}
          <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400 truncate">{selectedFile.path}</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>

          {/* Code Text Area */}
          <div className="flex-1 p-4 overflow-auto max-h-[500px]">
            <pre className="leading-relaxed whitespace-pre font-mono">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
