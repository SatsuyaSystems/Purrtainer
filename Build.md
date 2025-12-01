# install deps
npm ci

# generate native android project (expo managed -> prebuild)
npx expo prebuild --platform android --clean

npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res

# build debug APK (fast, unsigned debug)
cd android
# on Windows use gradlew.bat
gradlew.bat assembleDebug

# resulting APK:
# android\app\build\outputs\apk\debug\app-debug.apk

# install to attached device/emulator
adb install -r android\app\build\outputs\apk\debug\app-debug.apk


org.gradle.java.home=C:\\Program Files\\Java\\jdk-17 in grade.props
sdk.dir=C:\\Users\\Jibril\\AppData\\Local\\Android\\Sdk in local.props

