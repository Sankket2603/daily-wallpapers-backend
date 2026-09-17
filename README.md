# Daily Wallpapers — Production Android Application & Cloud Backend

> **A minimal, elegant wallpaper discovery and download application.**
> *"A new wallpaper every day."*

---

## 1. Project Architecture Overview

```text
DAILY WALLPAPERS
├── /android                 # Native Android 10+ (Android 14/15/16 ready)
│   ├── app/src/main/java    # Kotlin + Jetpack Compose + Material 3
│   │   └── com/dailywallpapers/app
│   │       ├── admob/       # Google Mobile Ads Rewarded Ad Manager
│   │       ├── wallpaper/   # Android WallpaperManager & Scoped Storage helper
│   │       ├── data/        # Retrofit Models & API client
│   │       └── ui/          # Edge-to-edge Compose screens & Theme
│   ├── AndroidManifest.xml  # Scoped permissions & AdMob app ID
│   └── build.gradle.kts     # Compose BOM, Coil 3, Retrofit, Play Services Ads
│
├── /database
│   └── schema.sql           # PostgreSQL / Supabase DDL, RLS policies, indexes, seed data
│
├── /backend
│   └── server.ts            # Node.js + Express REST API & Vite middleware
│
└── /admin
    └── Dashboard            # Secure Admin upload, categories, daily scheduler & analytics
```

---

## 2. Android App Configuration & Build

### Prerequisites
* **Android Studio Ladybug** (2024.2+) or newer
* **JDK 17** or **JDK 21**
* Android SDK 35 (Android 15)

### Running on Emulator / Physical Device
1. Open Android Studio.
2. Select **Open an Existing Project** and browse to the `/android` directory.
3. Allow Gradle to synchronize dependencies.
4. Select an Android emulator (Pixel 8 / Pixel 9 with Android 14+) or connect a physical device via USB debugging.
5. Click **Run** (`Shift + F10`).

---

## 3. AdMob Configuration (Rewarded Ads)

### Test vs Production Ad Units
The app utilizes **Google AdMob Rewarded Ads** with strict callback verification (unlocks ONLY when `onUserEarnedReward` fires; skipping/closing will NOT unlock the wallpaper).

* **Development (Default Test IDs)**:
  * Application ID: `ca-app-pub-3940256099942544~3347511713`
  * Rewarded Ad Unit ID: `ca-app-pub-3940256099942544/5224354917`
* **Production Setup**:
  1. Create an account on [Google AdMob](https://admob.google.com/).
  2. Create a new Android App in the AdMob console and generate a **Rewarded Ad Unit**.
  3. Replace the `ADMOB_APP_ID` in `AndroidManifest.xml`:
     ```xml
     <meta-data
         android:name="com.google.android.gms.ads.APPLICATION_ID"
         android:value="YOUR_PRODUCTION_ADMOB_APP_ID" />
     ```
  4. Update `ADMOB_REWARDED_AD_UNIT_ID` in `app/build.gradle.kts`.

---

## 4. Backend & Supabase Database Configuration

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase.
3. Paste and run `/database/schema.sql`. This provisions:
   * `wallpapers` table with thumbnail, medium, full, and original CDN fields.
   * `categories` table with slug indices.
   * `favorites` and `downloads` tracking tables.
   * `daily_wallpapers` scheduler table.
   * Row Level Security (RLS) policies ensuring public read and authenticated admin write.
4. Create a public Storage bucket named `wallpapers` with folders:
   * `wallpapers/original/`
   * `wallpapers/thumbnail/`
   * `wallpapers/medium/`
   * `wallpapers/full/`

---

## 5. Admin Authentication & Wallpaper Upload

### Default Admin Credentials
* **Email**: `admin@dailywallpapers.app`
* **Password**: `admin123`

### Uploading Wallpapers
1. Navigate to the Admin Dashboard in the web console.
2. Click **Upload Wallpaper**.
3. Select an image (JPEG, PNG, WEBP up to 20MB).
4. The system automatically reads dimensions (9:16, 16:9, 1:1, 4:5, 20:9), calculates aspect ratio, compresses versions, generates CDN URLs, and populates the database.
5. Check **Featured** or **Wallpaper of the Day** as desired.
6. Click **Publish Wallpaper**.

---

## 6. How to Build Release APK & Signed AAB for Google Play

### Generate Signed APK
```bash
cd android
./gradlew assembleRelease
```
The output APK will be placed at `app/build/outputs/apk/release/app-release.apk`.

### Generate Signed Android App Bundle (AAB)
```bash
./gradlew bundleRelease
```
The bundle will be generated at `app/build/outputs/bundle/release/app-release.aab`. Upload this file to the Google Play Developer Console.

---

## 7. UX & Ad Logic Guarantee

* **No Ads on Browsing**: Zero ads when launching, scrolling, or viewing full-screen wallpaper details.
* **Ad Value Exchange**: Rewarded ads show ONLY when tapping **Download** or **Apply Wallpaper**.
* **Anti-Bypass Protection**: Wallpaper unlocks ONLY upon receiving the verified AdMob completion reward callback.
* **No Duplicate Ads**: If a wallpaper is already downloaded or was unlocked during the active session (30-minute window), it can be applied immediately without watching another ad.
