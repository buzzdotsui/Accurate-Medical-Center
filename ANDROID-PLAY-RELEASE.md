# Android Release & Google Play Checklist (Phase 1 — Invoice items B + E)

**Status:** Project scaffolded in-repo. Actual `.aab` build and Play Console upload require Android Studio/SDK + a Google Play developer account (external).

## App identity

| Field | Value |
|-------|--------|
| Application ID | `com.accuratemedicalcentre.hms` |
| App name | Accurate Medical Center |
| Package (Capacitor) | same as application ID |
| Backend | Existing HMS web app (HTTPS production origin) — no second backend |

## Prerequisites (external / machine)

- [ ] JDK 17+
- [ ] Android SDK 34+ + build-tools (via Android Studio)
- [ ] `ANDROID_HOME` / `JAVA_HOME` on PATH
- [ ] Google Play Console account ($25 one-time) with app ownership confirmed by client
- [ ] Signing keystore generated and stored **outside** the repo (never commit `.jks`/`.keystore`)

## Generate keystore (once)

```bash
keytool -genkeypair -v \
  -keystore accurate-hms-upload.keystore \
  -alias accurate-hms \
  -keyalg RSA -keysize 2048 -validity 10000
```

Store password + key password in the client password manager — **not** in git.

## Build commands (after SDK is installed)

```bash
# Sync web assets + Android platform
npm run mobile:sync

# Debug APK for QA
npm run mobile:android

# Release AAB (example gradle invocation from android/)
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```

Sign the AAB with the upload keystore (or configure `android/app/build.gradle` signingConfig for release).

## Google Play submission package

1. **Store listing**
   - Title: Accurate Medical Center
   - Short description: Hospital management for patients and care teams.
   - Full description: Patient portal, appointments, records, lab results, prescriptions, billing.
   - Category: Medical
   - Privacy policy URL (required) — host on production domain
2. **Graphics**
   - App icon 512×512 PNG
   - Feature graphic 1024×500
   - At least 2 phone screenshots (login, dashboard)
3. **Content rating questionnaire** — Medical / health app
4. **Data safety form** — declare: account info, health app data (if applicable), no sale of data
5. **Upload AAB** to internal testing → closed testing → production track
6. **Content declarations**: app does not provide emergency care advice; for hospital staff/patients of Accurate Medical Centre only

## Blocking items (mark in delivery report)

| Item | Owner | Status |
|------|-------|--------|
| Android SDK + JDK on build machine | Client / DevOps | `BLOCKED — EXTERNAL` |
| Upload keystore + Play Console access | Client | `BLOCKED — EXTERNAL CLIENT ACTION` |
| Production domain live (app loads origin) | Client | `BLOCKED — EXTERNAL` |
| Privacy policy URL | Client + Dev team | Required before Play review |

## What is already in the repo (done)

- [x] `capacitor.config.ts` (appId, production server URL, https scheme)
- [x] `public/manifest.json` (PWA manifest for web + install prompts)
- [x] `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` dependencies
- [x] `npm run mobile:*` scripts
- [x] This checklist for Play handoff
