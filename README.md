# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Code Quality & Git Hooks

This project uses [Biome.js](https://biomejs.dev/) for code formatting and linting, with [Husky](https://typicode.github.io/husky/) to enforce code quality via git hooks.

### Available Commands

```bash
# Check for formatting and lint issues
yarn biome:check

# Auto-fix all formatting and safe lint issues
yarn biome:fix

# Format all files
yarn biome:format

# Run linter only
yarn biome:lint
```

### Pre-commit Hooks

Every commit is automatically checked by Biome. The pre-commit hook will:
- ✅ Auto-fix formatting issues on staged files
- ✅ Check for lint errors
- ❌ Block commits if there are unfixable errors

**Example workflow:**
```bash
git add .
git commit -m "your message"
# Biome automatically runs and fixes your staged files
```

### Configuration

- **Biome config**: [`biome.json`](./biome.json)
  - Tabs for indentation (width: 2)
  - Single quotes for JS, double quotes for JSX
  - Semicolons as needed
  - Trailing commas
  - Auto-organize imports

- **Lint-staged config**: [`package.json`](./package.json) (see `lint-staged` field)
  - Runs on `*.{js,jsx,ts,tsx}` files
  - Only checks staged files for faster commits

### What Gets Checked

1. **Formatting** - Code style (indentation, quotes, semicolons)
2. **Linting** - Code quality (unused variables, type errors, etc.)
3. **Import Organization** - Alphabetically sorted imports

### Troubleshooting

If a commit is blocked:
1. Review the error messages shown by Biome
2. Fix the issues manually or run `yarn biome:fix`
3. Stage the fixed files: `git add .`
4. Try committing again

## Push Notifications

This app uses [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) for push notifications. The integration is complete, but **requires additional configuration** in Apple Developer Console and Google Firebase Console before notifications will work in production.

### ⚠️ Important Notes

- **Physical device required** - Push notifications do NOT work on emulators/simulators
- **Store configuration required** - See checklists below for App Store and Play Store setup
- **Test locally first** - Use the Notifications tab in the app to test local notifications

### Quick Start

1. Run the app on a **physical device**:
   ```bash
   yarn ios  # or yarn android
   ```

2. Navigate to the **Notifications** tab
3. Grant notification permissions when prompted
4. Tap "Schedule Notification" to test local notifications
5. Your Expo Push Token will be displayed (needed for backend integration)

### iOS Configuration Checklist (App Store)

Before push notifications work on iOS in production, complete these steps:

- [ ] **Apple Developer Account** - Ensure you have an active Apple Developer account
- [ ] **App Identifier** - Register your app bundle ID in [Apple Developer Console](https://developer.apple.com/account/resources/identifiers/list)
- [ ] **Enable Push Notifications** - In your App ID configuration, enable "Push Notifications" capability
- [ ] **APNs Key** - Create an Apple Push Notification service (APNs) key:
  - Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/authkeys/list)
  - Create a new key with "Apple Push Notifications service (APNs)" enabled
  - Download the `.p8` key file (you can only download it once!)
  - Note the Key ID and Team ID
- [ ] **Upload to Expo** - Add your APNs credentials to your Expo project:
  ```bash
  eas credentials
  ```
  - Select iOS → Push Notifications
  - Upload your `.p8` key file
  - Enter your Key ID and Team ID
- [ ] **Build with EAS** - Build your app with EAS Build to include the credentials:
  ```bash
  eas build --platform ios
  ```

### Android Configuration Checklist (Play Store)

Before push notifications work on Android in production, complete these steps:

- [ ] **Firebase Project** - Create a project in [Firebase Console](https://console.firebase.google.com/)
- [ ] **Add Android App** - Register your Android app in Firebase:
  - Use your package name from `app.json` (e.g., `com.yourcompany.ukki`)
  - Download `google-services.json`
- [ ] **Enable FCM** - Enable Firebase Cloud Messaging (FCM) in your Firebase project
- [ ] **Get Server Key** - Obtain your FCM Server Key:
  - Go to Project Settings → Cloud Messaging
  - Copy the "Server key" (legacy) or create a new service account key
- [ ] **Upload to Expo** - Add your FCM credentials to your Expo project:
  ```bash
  eas credentials
  ```
  - Select Android → Push Notifications
  - Upload your `google-services.json` or enter your Server Key
- [ ] **Build with EAS** - Build your app with EAS Build to include the credentials:
  ```bash
  eas build --platform android
  ```

### Testing Push Notifications

#### Local Notifications (No setup required)
1. Open the app on a physical device
2. Go to the Notifications tab
3. Tap "Schedule Notification"
4. Notification appears in 2 seconds

#### Remote Push Notifications (Requires setup)
1. Complete iOS or Android configuration above
2. Get your Expo Push Token from the Notifications tab
3. Send a test notification using [Expo Push Notification Tool](https://expo.dev/notifications)
4. Or integrate with your backend using the [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)

### Integration with Backend

To send push notifications from your backend:

1. **Get the user's push token** - Available in the Notifications tab or via `useNotifications()` hook
2. **Store the token** - Save it in your database associated with the user
3. **Send notifications** - Use the [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/):

```javascript
// Example: Send notification from your backend
const message = {
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  sound: 'default',
  title: 'Hello!',
  body: 'This is a push notification',
  data: { someData: 'goes here' },
};

await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message),
});
```

### Troubleshooting

**"Must use physical device for Push Notifications"**
- Push notifications don't work on emulators/simulators
- Use a real iOS or Android device

**"Failed to get push token"**
- Ensure you've granted notification permissions
- Check that you've completed the iOS/Android configuration steps above
- Verify your EAS project is set up correctly: `eas whoami`

**Notifications not appearing**
- Check notification permissions in device Settings
- Verify the app is not in Do Not Disturb mode
- Ensure you've uploaded credentials to Expo (see checklists above)
- Check FCM/APNs credentials are valid and not expired

**"Project ID not found" error**
- Run `eas init` to initialize your EAS project
- Ensure `app.json` has the correct project ID in `extra.eas.projectId`

### Learn More

- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Expo Notifications API Reference](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notification Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)

## Deep Linking

This app supports deep linking using [Expo Linking](https://docs.expo.dev/guides/linking/) and expo-router. Deep links allow external apps, websites, and notifications to open specific screens in your app.

### App Scheme

The app uses the custom URL scheme: **`ukki://`**

### Quick Start

1. Run the app on a device or simulator
2. Navigate to the **Deep Links** tab
3. Test deep links using the built-in testing interface
4. Try example links like `ukki://notifications?id=123`

### Supported Deep Link Formats

```
ukki://                              → Home screen
ukki://notifications                 → Notifications tab
ukki://notifications?id=123          → Notification with ID
ukki://explore                       → Explore tab
ukki://deep-links                    → Deep Links testing screen
```

### Custom Hook Usage

The app provides a powerful `useDeepLink` hook for handling deep links:

#### Basic Usage (Automatic Navigation)

```tsx
import { useDeepLink } from '@/hooks/use-deep-link'

function MyComponent() {
  // Automatically handles navigation via expo-router
  useDeepLink()
}
```

#### Custom Handler with Data Processing

```tsx
import { useDeepLink } from '@/hooks/use-deep-link'
import { useRouter } from 'expo-router'

function MyComponent() {
  const router = useRouter()

  useDeepLink({
    onDeepLink: async (data) => {
      // data contains: url, path, queryParams, hostname, scheme
      
      if (data.path === '/product') {
        const productId = data.queryParams.id
        
        // Fetch product data
        const product = await fetchProduct(productId)
        
        // Navigate with data
        router.push(`/product/${productId}`)
        
        return true // Handled
      }
      
      return false // Not handled, use default navigation
    }
  })
}
```

#### Path Filtering

```tsx
useDeepLink({
  // Only handle notification-related deep links
  pathFilter: ['/notifications', '/alerts'],
  onDeepLink: (data) => {
    console.log('Notification deep link:', data)
    // Process notification data
    return false // Let expo-router handle navigation
  }
})
```

### Testing Deep Links

#### From Within the App

1. Go to the **Deep Links** tab
2. Enter a deep link URL in the text input
3. Tap "Open Deep Link" to test navigation

#### From Safari (iOS) or Chrome (Android)

1. Build and install the app on a physical device
2. Open Safari (iOS) or Chrome (Android)
3. Type a deep link URL in the address bar: `ukki://notifications?id=123`
4. The app should open automatically

#### From Terminal (iOS Simulator)

```bash
xcrun simctl openurl booted "ukki://notifications?id=123"
```

#### From Terminal (Android Emulator)

```bash
adb shell am start -W -a android.intent.action.VIEW -d "ukki://notifications?id=123"
```

### Universal Links (Production)

For production apps, configure universal links to use HTTPS URLs instead of custom schemes:

#### iOS - Associated Domains

1. Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:ukki.app"]
    }
  }
}
```

2. Host an `apple-app-site-association` file at `https://ukki.app/.well-known/apple-app-site-association`

#### Android - App Links

1. Add to `app.json`:
```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "ukki.app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

2. Host an `assetlinks.json` file at `https://ukki.app/.well-known/assetlinks.json`

### Integration with Push Notifications

Deep links work seamlessly with push notifications:

```javascript
// Send push notification with deep link
const message = {
  to: 'ExponentPushToken[...]',
  title: 'New Message',
  body: 'You have a new message!',
  data: {
    // This will trigger deep link navigation when notification is tapped
    url: 'ukki://notifications?id=123&type=message'
  }
}
```

Then in your app, handle the notification response:

```tsx
import { useNotifications } from '@/hooks/use-notifications'
import { useDeepLink } from '@/hooks/use-deep-link'

function App() {
  const { notificationResponse } = useNotifications()
  const { openDeepLink } = useDeepLink()

  useEffect(() => {
    if (notificationResponse?.notification.request.content.data.url) {
      openDeepLink(notificationResponse.notification.request.content.data.url)
    }
  }, [notificationResponse])
}
```

### Example Implementation

See `hooks/use-app-deep-links.ts` for a complete example showing:
- Notification deep links with query parameters
- Product deep links with dynamic IDs
- Profile deep links
- Custom data processing before navigation

### Troubleshooting

**Deep link doesn't open the app**
- Ensure the app is installed on the device
- Check that the URL scheme matches exactly (`ukki://`)
- On iOS, universal links require HTTPS and proper configuration

**App opens but doesn't navigate**
- Check the Deep Links tab to see if the link was received
- Verify the path exists in your expo-router file structure
- Check console logs for error messages

**Universal links not working**
- Verify your `apple-app-site-association` or `assetlinks.json` file is accessible
- Ensure the domain is properly configured in app.json
- Test with Apple's [App Site Association Validator](https://search.developer.apple.com/appsearch-validation-tool/)

### Learn More

- [Expo Linking Guide](https://docs.expo.dev/guides/linking/)
- [Expo Router Linking](https://docs.expo.dev/router/reference/linking/)
- [Universal Links (iOS)](https://developer.apple.com/ios/universal-links/)
- [App Links (Android)](https://developer.android.com/training/app-links)

## CI/CD & Product Flavors (EAS Build)

This project is configured with multiple environment flavors (Dev, Stage, Prod) using [EAS Build](https://docs.expo.dev/build/introduction/) and [Expo Updates](https://docs.expo.dev/eas-update/introduction/).

### Environment Configurations

| Setting | Dev | Stage | Prod |
|---------|-----|-------|------|
| **App Name** | Ukki Dev | Ukki Stage | Ukki |
| **Bundle ID/Package** | `com.ukki.customer.dev` | `com.ukki.customer.stage` | `com.ukki.customer` |
| **Scheme** | `ukki-dev://` | `ukki-stage://` | `ukki://` |
| **Update Channel** | `dev` | `stage` | `production` |

### Build Commands

#### Local Development
```bash
# Start with Dev config
yarn start:dev

# Start with Stage config
yarn start:stage

# Start with Prod config
yarn start:prod
```

#### EAS Build (Store-ready binaries)
```bash
# Build Dev version
yarn build:dev --platform [ios|android|all]

# Build Stage version
yarn build:stage --platform [ios|android|all]

# Build Prod version
yarn build:prod --platform [ios|android|all]
```

#### OTA Updates (Expo Updates)
```bash
# Publish update to Dev channel
yarn update:dev

# Publish update to Stage channel
yarn update:stage

# Publish update to Production channel
yarn update:prod
```

### Store Account Setup TODO List

#### 🍏 Apple App Store (iOS)
- [ ] **Create Developer Account**: Enroll in the [Apple Developer Program](https://developer.apple.com/programs/).
- [ ] **Register App Identifiers**: Create Bundle IDs for `com.ukki.customer`, `com.ukki.customer.stage`, and `com.ukki.customer.dev`.
- [ ] **Configure App Store Connect**: Create matching app entries in [App Store Connect](https://appstoreconnect.apple.com/).
- [ ] **Set up EAS Secrets**: Add matching `EXPO_APPLE_ID` and `EXPO_APPLE_PASSWORD` if using automated submission.
- [ ] **EAS Credentials**: Run `eas credentials` to sync certificates and provisioning profiles.

#### 🤖 Google Play Store (Android)
- [ ] **Create Developer Account**: Set up a [Google Play Console](https://play.google.com/console/) account.
- [ ] **Create App Projects**: Create new apps for each flavor (or use suffixes in one project if allowed).
- [ ] **Service Account Key**: Generate a Google Cloud Service Account key for EAS to automate submissions.
- [ ] **EAS Credentials**: Run `eas credentials` to manage keystores.
- [ ] **Upload Internal Test**: Manually upload the first `.aab` to enable automated submissions later.

### Universal Links / App Links Setup
- [ ] **Host AASA file (iOS)**: Place at `yourdomain.com/.well-known/apple-app-site-association`.
- [ ] **Host AssetLinks file (Android)**: Place at `yourdomain.com/.well-known/assetlinks.json`.
- [ ] **Update app.config.js**: Update the `associatedDomains` and `intentFilters` with your actual domain.
