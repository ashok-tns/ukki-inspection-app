# EAS Configuration Guide

This guide explains how to manage Expo Application Services (EAS) configuration, handle product flavors, and create new projects based on this template.

## 1. Where is the Project ID maintained?

In this project, the **EAS Project ID** is maintained in [app.config.js](file:///Users/hubmacair/Development/Tabs/ukki/customer_mobile_app/app.config.js).

Look for the `extra.eas.projectId` field:

```javascript
extra: {
    eas: {
        projectId: 'f66ce6d5-08aa-4b25-b964-c67d735bb334'
    }
}
```

Additionally, the **Expo Updates URL** also uses this ID:
`url: 'https://u.expo.dev/f66ce6d5-08aa-4b25-b964-c67d735bb334'`

## 2. Adding a New Product Flavor

To add a new flavor (e.g., a "Premium" or "Enterprise" version):

### Step A: Update `app.config.js`
Add a new case to the `getEnvConfig` function to define the unique identifiers for the new flavor:

```javascript
case 'premium':
    return {
        name: 'Ukki Premium',
        bundleIdentifier: 'com.ukki.customer.premium',
        package: 'com.ukki.customer.premium',
        scheme: 'ukki-premium',
        updateChannel: 'premium',
        apiUrl: 'https://premium-api.ukki.customer',
    }
```

### Step B: Update `eas.json`
Add a corresponding build profile in `eas.json`:

```json
"production-premium": {
    "extends": "production",
    "env": {
        "APP_ENV": "premium"
    }
}
```

### Step C: Build the flavor
Run the build command with the new profile:
```bash
eas build --profile production-premium --platform ios
```

## 3. Managing iOS Credentials (Apple Certificates)

To build for iOS, you need an **Apple Distribution Certificate** and a **Provisioning Profile**. EAS can manage these for you automatically or you can provide them manually.

### Option A: Automatic Management (Recommended)
This is the easiest way. EAS will communicate with Apple's servers and handle everything.

1.  **Run the command**:
    ```bash
    eas credentials
    ```
2.  **Follow the prompts**:
    - Select **iOS**.
    - Select the build profile (e.g., `production`).
    - Log in to your Apple Developer account when prompted.
    - Choose **"Set up a new distribution certificate"** if you don't have one.
    - Choose **"Set up a new provisioning profile"**.
3.  **Verification**: EAS will store these securely on their servers. You can see them in your [Expo Dashboard](https://expo.dev/accounts/ashok-tns/projects/Ukki/credentials).

### Option B: Manual Management
If you already have a `.p12` certificate and a `.mobileprovision` file:

1.  **Run the command**:
    ```bash
    eas credentials
    ```
2.  **Choose Manual Setup**: Select "Manually provide credentials".
3.  **Upload files**: Follow the instructions to upload your certificate and provisioning profile.

### Common Troubleshooting
-   **"Team ID mismatch"**: Ensure the `appleTeamId` in your `eas.json` matches your Apple Developer Team ID.
-   **"Missing Distribution Certificate"**: If a build fails with this error, run `eas credentials` and ensure a valid Distribution Certificate is linked to the build profile.
-   **Adding New Devices**: If you are doing **Internal Distribution (Ad Hoc)**, you must register the device UDIDs via `eas device:create` before creating the provisioning profile.

## 4. Releasing Over-the-Air (OTA) Updates

OTA updates allow you to fix bugs or update the UI without requiring users to download a new version from the App Store or Play Store.

### How it works
Updates are published to a **Channel**. Each app flavor is configured in `app.config.js` to listen to a specific channel:
- `dev` listens to the `dev` channel.
- `stage` listens to the `stage` channel.
- `prod` listens to the `production` channel.

### Releasing an Update
To publish changes to a specific flavor, use the `eas update` command with the appropriate channel:

#### For Development Flavor:
```bash
# Using the package.json script:
yarn update:dev

# Or manually:
APP_ENV=dev eas update --channel dev --message "Fix: updated landing page logic"
```

#### For Staging Flavor:
```bash
# Using the package.json script:
yarn update:stage

# Or manually:
APP_ENV=stage eas update --channel stage --message "Feature: added new notification channel"
```

#### For Production Flavor:
```bash
# Using the package.json script:
yarn update:prod

# Or manually:
APP_ENV=prod eas update --channel production --message "Release: v1.0.1 hotfix"
```

> [!IMPORTANT]
> Always ensure you have the correct `APP_ENV` set when running the manual command, as it affects the API URLs and other environment-specific constants defined in `app.config.js`.

## 4. Creating a New Project (Cloning)

If you copy this project to start a completely new app, follow these steps to reset the EAS link:

1.  **Update Identifiers**: In `app.config.js`, change the `slug`, `name`, `bundleIdentifier`, and `package` to your new app's details.
2.  **Remove Old IDs**: 
    - Delete the `projectId` from `extra.eas.projectId`.
    - Comment out or remove the `updates.url`.
3.  **Re-initialize EAS**:
    Run the following command in your terminal:
    ```bash
    eas init
    ```
    - Select your account and provide the new project name.
    - EAS will generate a **new Project ID**.
4.  **Update Config**: 
    - Copy the new `projectId` provided by EAS into `app.config.js`.
    - Update the `updates.url` with the new ID: `https://u.expo.dev/[NEW_PROJECT_ID]`.
5.  **Configure EAS Build**:
    Run `eas build:configure` to ensure `eas.json` is updated for the new project.

---

### Summary of change locations:
| Feature | File | Variable |
| :--- | :--- | :--- |
| **Project Identity** | `app.config.js` | `slug`, `ios.bundleIdentifier`, `android.package` |
| **EAS Link** | `app.config.js` | `extra.eas.projectId` |
| **OTA Updates** | `app.config.js` | `updates.url` |
| **Build Settings** | `eas.json` | `build.profiles` |
