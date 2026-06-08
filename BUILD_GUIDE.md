# Personal AI OS - Android APK Build Guide

## Automatic Build (GitHub Actions)

The APK builds automatically when you push to `main` or any `feature/**` branch.

**Monitor Build:**
1. Go to https://github.com/Suresh1596/Ai-project/actions
2. Select the latest workflow run
3. Wait for "Build Personal AI OS APK" to complete (usually 8-12 minutes)
4. Download `PersonalAI-OS-debug-apk` artifact

**Why `feature/**` branches trigger:**
- Updated `.github/workflows/build-apk.yml` to include feature branches
- Allows testing before merging to main

---

## Manual Local Build

### Prerequisites
- Node.js 18+ (installed ✓)
- Java 17 JDK
- Android SDK (optional, GH Actions handles it)

### Steps

```bash
# 1. Clone and switch to feature branch
git clone https://github.com/Suresh1596/Ai-project.git
cd Ai-project
git checkout feature/personal-ai-os-v1

# 2. Install dependencies
npm install

# 3. Build React app
npm run build

# 4. Install Capacitor CLI (if not already installed)
npm install -g @capacitor/cli@6

# 5. Add Android platform (first time only)
npx cap add android

# 6. Sync web assets
npx cap sync android

# 7. Build APK
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Common Issues & Fixes

### 1. Gradle Download Timeout (403 Error)

**Problem:** `Server returned HTTP response code: 403`

**Fix (GitHub Actions):**
- The workflow uses `ubuntu-latest` with pre-cached dependencies
- GH Actions will retry automatically
- If it persists, manually trigger workflow:
  ```
  1. Go to Actions tab
  2. Select "Build Personal AI OS APK"
  3. Click "Run workflow" → "Run workflow"
  ```

**Fix (Local):**
```bash
# Use Gradle wrapper cached version
cd android
./gradlew clean assembleDebug --gradle-version=8.2.1

# Or upgrade wrapper
./gradlew wrapper --gradle-version=8.7.1
```

### 2. Java Version Mismatch

```bash
# Check Java version
java -version

# Should be 17 or higher. If not:
# On Ubuntu:
sudo apt update && sudo apt install -y openjdk-17-jdk

# On macOS:
brew install openjdk@17

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### 3. Permission Denied on gradlew

```bash
cd android
chmod +x gradlew
```

### 4. Node/npm Caching Issues

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 5. Capacitor Sync Issues

```bash
# Force re-sync
npx cap sync android --no-live

# Or clean and rebuild
rm -rf android/app/src/main/assets/public
npx cap sync android
npm run build
npx cap copy android
```

---

## Testing the APK

### On Physical Device or Emulator

```bash
# Connect Android device or start emulator, then:
cd android
./gradlew installDebug

# Or use adb directly:
adb install app/build/outputs/apk/debug/app-debug.apk
```

### APK Details

- **Name:** `app-debug.apk`
- **Size:** ~5-8 MB (compressed)
- **Target SDK:** Android 13+
- **Min SDK:** Android 9 (API 28)
- **Package:** `com.example.localmindai` (update in `android/app/build.gradle` if needed)

---

## Release Build (Optional)

For production, generate a signed release APK:

```bash
# 1. Create keystore (one-time)
keytool -genkey -v -keystore personal-ai-os.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias personal-ai-os

# 2. Add to gradle.properties
echo "MYAPP_UPLOAD_STORE_FILE=personal-ai-os.keystore" >> android/gradle.properties
echo "MYAPP_UPLOAD_KEY_ALIAS=personal-ai-os" >> android/gradle.properties
# (set password when prompted)

# 3. Update build.gradle (in android/app/)
# Add signing config before buildTypes

# 4. Build release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

---

## Monitoring & Debugging

### View build logs:

```bash
# Verbose output
./gradlew assembleDebug -i

# Stack trace
./gradlew assembleDebug --stacktrace

# Debug info from logcat (after install)
adb logcat | grep "Personal\|AI\|OS"
```

### Check APK contents:

```bash
# List what's in the APK
unzip -l app/build/outputs/apk/debug/app-debug.apk

# Extract and check assets
unzip app/build/outputs/apk/debug/app-debug.apk -d apk-extracted
ls apk-extracted/assets/public/
```

---

## What's in the APK

- React app (index.html + bundle)
- Capacitor runtime
- 4 Capacitor plugins:
  - @capacitor/app (lifecycle)
  - @capacitor/keyboard (keyboard handling)
  - @capacitor/status-bar (status bar)
  - @capacitor/haptics (vibration)
- Web assets (fonts, styles, icons)

---

## Next Steps

1. **Install on device:** Download APK from GH Actions artifacts
2. **Test UI:** Navigate through Chat, Agents, Services, Memory, Tasks, Models
3. **Configure API:** Add your Anthropic API key in settings (or env)
4. **Test agents:** Chat with Database Agent (Snowflake-optimized)
5. **Service Mesh NL:** Try "Schedule a meet tomorrow 3pm" in NL console

---

## GitHub Actions Workflow Status

View at: `https://github.com/Suresh1596/Ai-project/actions`

**Branch:** `feature/personal-ai-os-v1`  
**Workflow:** Build Personal AI OS APK  
**Triggers:** Push to main, feature/**, manual dispatch  
**Timeout:** 60 minutes  
**Node:** 22  
**Java:** 17 (Temurin)

---

Made with ⬡ for ts@TCS | Personal AI OS v1.0
