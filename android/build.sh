#!/bin/bash
cd ..
npx cap sync
cd android
./gradlew assembleRelease
  apksigner sign --ks-pass file:keystorepass --ks ~/keystore.jks  --out  ../server/public/rhea.apk app/build/outputs/apk/release/app-release-unsigned.apk