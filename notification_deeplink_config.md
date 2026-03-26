# Notification & Deep Link Store Configuration

To test Push Notifications and Deep Links (Universal Links/App Links) in a production or staging environment, you must configure settings at the Apple Developer Portal and Google Play Console.

## 1. iOS Configuration (Apple Developer Portal)

### Push Notifications
1.  **Generate Auth Key**: Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/authkeys/list) and create a new **Apple Push Notifications service (APNs)** key.
2.  **Upload to EAS**: Run `eas credentials` and following the prompts to upload the `.p8` file to Expo. EAS will use this to send notifications.
3.  **App Identifier**: Ensure your App ID has the "Push Notifications" capability enabled.

### Deep Linking (Universal Links)
1.  **Associated Domains**: In the Apple Developer Portal, add the "Associated Domains" capability to your App ID.
2.  **Add Domain**: In `app.config.js`, add the domain to `ios.associatedDomains`:
    ```javascript
    ios: {
        associatedDomains: ['applinks:yourdomain.com']
    }
}
```
3.  **AASA File**: Host a file at `https://yourdomain.com/.well-known/apple-app-site-association`:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "PREFIX.com.ukki.customer",
        "paths": ["*"]
      }
    ]
  }
}
```

---

## 2. Android Configuration (Google Play Console / Firebase)

### Push Notifications (FCM)
1.  **Firebase Project**: Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  **Add Android App**: Use the package name (e.g., `com.ukki.customer`) and download `google-services.json`.
3.  **Cloud Messaging**: Enable Firebase Cloud Messaging API.
4.  **Upload to EAS**: Run `eas credentials` and upload the Google Service Account Key (JSON) to Expo.

### Deep Linking (App Links)
1.  **Digital Asset Links**: Host a file at `https://yourdomain.com/.well-known/assetlinks.json`.
2.  **Generate JSON**: Use the [Digital Asset Links Assistant](https://developers.google.com/digital-asset-links/tools/generator) or create manually:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.ukki.customer",
    "sha256_cert_fingerprints": ["YOUR_APP_SHA256_FINGERPRINT"]
  }
}]
```
*Note: You can find your SHA256 fingerprint in the Google Play Console under **Setup > App Integrity**.*

---

## 3. Testing Strategies

-   **Notifications**: Use the [Expo Push Debugger](https://expo.dev/notifications) to send test payloads using your Expo Push Token.
-   **Deep Links**:
    -   **iOS**: Type the URL in the Notes app and long-press it. It should offer to open in your app.
    -   **Android**: Use ADB:
        ```bash
        adb shell am start -W -a android.intent.action.VIEW -d "https://yourdomain.com/path" com.ukki.customer
        ```

> [!TIP]
> Use `npx expo-env-info` to check if your environment variables and bundle identifiers match between your local code and the store portals.
