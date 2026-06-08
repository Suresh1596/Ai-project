#!/bin/bash

# Personal AI OS - Build Script for Android APK
# Handles network issues, caching, and provides clear output

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
  exit 1
}

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
  log_error "Node.js not found. Install Node.js 18+ from https://nodejs.org"
fi

if ! command -v npm &> /dev/null; then
  log_error "npm not found"
fi

if ! command -v java &> /dev/null; then
  log_error "Java not found. Install JDK 17 (openjdk-17-jdk)"
fi

JAVA_VERSION=$(java -version 2>&1 | head -1)
log_info "Found: $JAVA_VERSION"

log_success "Prerequisites OK"
echo ""

# Step 1: Install dependencies
log_info "Installing dependencies..."
npm ci --prefer-offline --no-audit 2>&1 | grep -E "packages|vulnerabilities|npm notice" || true
log_success "Dependencies installed"
echo ""

# Step 2: Build React app
log_info "Building React app..."
npm run build > /dev/null 2>&1
log_success "React app built"
echo ""

# Step 3: Install Capacitor CLI
log_info "Installing Capacitor CLI..."
npm install -g @capacitor/cli@6 > /dev/null 2>&1
log_success "Capacitor CLI installed"
echo ""

# Step 4: Add Android platform (if not exists)
if [ ! -d "android" ]; then
  log_info "Adding Android platform (first-time setup)..."
  npx cap add android > /dev/null 2>&1
  log_success "Android platform added"
else
  log_warn "Android platform already exists, skipping add"
fi
echo ""

# Step 5: Sync web assets
log_info "Syncing web assets to Android..."
npx cap sync android > /dev/null 2>&1
log_success "Web assets synced"
echo ""

# Step 6: Build Android APK
log_info "Building Android Debug APK..."
log_warn "This may take 3-5 minutes on first build (downloading Gradle, dependencies, etc)"
echo ""

cd android

# Make gradlew executable
chmod +x gradlew

# Try to build with retry logic for network issues
MAX_RETRIES=2
RETRY=0

while [ $RETRY -lt $MAX_RETRIES ]; do
  if ./gradlew assembleDebug --no-daemon --stacktrace 2>&1 | tee build.log; then
    log_success "Android APK built successfully!"
    break
  else
    RETRY=$((RETRY + 1))
    if [ $RETRY -lt $MAX_RETRIES ]; then
      log_warn "Build failed. Retrying... (Attempt $((RETRY + 1))/$MAX_RETRIES)"
      # Clean gradle cache for retry
      rm -rf ~/.gradle/wrapper/dists
      sleep 5
    else
      log_error "Build failed after $MAX_RETRIES attempts. Check build.log for details."
    fi
  fi
done

echo ""

# Report APK location
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
  APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
  log_success "APK created: $APK_PATH ($APK_SIZE)"
  echo ""
  log_info "Next steps:"
  echo "  1. Install on device: adb install $APK_PATH"
  echo "  2. Or open Android Studio: npx cap open android"
  echo "  3. Or just copy the APK file to your device"
else
  log_error "APK not found at $APK_PATH"
fi
