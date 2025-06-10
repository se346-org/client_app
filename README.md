## Client app chat websocket

## Hướng dẫn chạy dự án với Bare Workflow

1. Giải nén file config.zip để lấy các file config
2. Copy file fcm-sa.json vào thư mục dự án backend_app/deployment/
3. Copy 2 file google-services, GoogleService-Info vào thư mục dự án client_app/
4. Tại thư mục dự án client_app/ chạy lệnh `npx expo prebuild`
5. Copy file debug.keystore vào client_app/android/app hoặc là đứng ở client_app chạy lệnh :
   cd android/app && keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
6. Chạy lệnh `cd android`. Tại client_app/android chạy lệnh `./gradlew clean && ./gradlew installDebug`
7. Chạy lệnh `cd ..` để di chuyển ra thư mục dự án. Tại client_app, chạy `npx expo run:android` đối với Android, hoặc `npx expo run:ios` đối với IOS.

### Thử nghiệm dự án
