# Firebase Configuration Guide

## Setup Steps

1. Create a Firebase project at https://console.firebase.google.com
2. Add Android app:

   - Package name: `com.litechat.app`
   - Download `google-services.json`
   - Place in project root

3. Add iOS app:
   - Bundle ID: `com.litechat.app`
   - Download `GoogleService-Info.plist`
   - Place in project root

## File Structure

```
client_app/
├── google-services.json        # Android config (DO NOT COMMIT)
├── GoogleService-Info.plist    # iOS config (DO NOT COMMIT)
└── ...
```

## Security Notes

- Never commit Firebase config files to git
- Keep these files secure as they contain sensitive information
- Share these files securely with team members
- Consider using environment variables or secure storage for production
