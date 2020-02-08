#!/bin/bash
cd ..
npx cap sync
cd android
./gradlew assembleDebug
apksigner sign --ks ~/keystore.jks --out app/build/outputs/apk/release/app-release-signed.apk ../server/public/rhea.apk