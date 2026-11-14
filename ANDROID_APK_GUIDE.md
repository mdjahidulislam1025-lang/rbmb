# Android APK Build Guide — Ranir Bazar Secondary High School

## Option 1: Fastest Way (No PC / No Android Studio, ~1 Minute)
1. Publish/share your app and copy the live HTTPS URL.
2. Go to **https://www.pwabuilder.com/** and paste your URL.
3. Click **Start** -> **Package for Stores** -> **Android** to download a ready-to-install `.apk` file.

## Option 2: Build APK Locally with Android Studio
```bash
npm install
npm run cap:sync
npm run cap:open
```
In Android Studio, click **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

## Option 3: Build APK Automatically on GitHub Actions
After pushing this repository to GitHub, open your repository on **github.com**, go to **Actions → set up a workflow yourself**, and create `.github/workflows/android-apk.yml` with:

```yaml
name: Build Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-android-apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
      - uses: android-actions/setup-android@v3
      - run: |
          npm install
          npm run build
          [ -d android ] || npx cap add android
          npx cap sync android
      - working-directory: android
        run: |
          chmod +x gradlew
          ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: rbhs-school-app-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
```
