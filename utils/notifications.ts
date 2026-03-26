import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Registers the device for push notifications and returns the Expo push token.
 * Handles permission requests for both iOS and Android.
 * Creates a default notification channel for Android (required for Android 13+).
 *
 * @returns Promise<string | undefined> - The Expo push token or undefined if registration fails
 */
export async function registerForPushNotificationsAsync(): Promise<
	string | undefined
> {
	let token: string | undefined;

	// Android requires a notification channel for the permissions prompt to appear
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "Default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	// Push notifications only work on physical devices
	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		// Request permissions if not already granted
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") {
			alert("Failed to get push notification permissions!");
			return;
		}

		// Get the Expo push token
		try {
			const projectId =
				Constants?.expoConfig?.extra?.eas?.projectId ??
				Constants?.easConfig?.projectId;

			if (!projectId) {
				throw new Error("Project ID not found");
			}

			token = (
				await Notifications.getExpoPushTokenAsync({
					projectId,
				})
			).data;

			console.log("Expo Push Token:", token);
		} catch (e) {
			console.error("Error getting push token:", e);
			token = undefined;
		}
	} else {
		alert("Must use physical device for Push Notifications");
	}

	return token;
}

/**
 * Schedules a local push notification to be delivered after a specified delay.
 *
 * @param title - The notification title
 * @param body - The notification body text
 * @param data - Optional data payload to include with the notification
 * @param seconds - Delay in seconds before the notification is shown (default: 2)
 * @returns Promise<string> - The notification identifier
 */
export async function schedulePushNotification(
	title: string,
	body: string,
	data?: Record<string, unknown>,
	seconds = 2,
): Promise<string> {
	return await Notifications.scheduleNotificationAsync({
		content: {
			title,
			body,
			data: data ?? {},
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
			seconds,
		},
	});
}

/**
 * Cancels all scheduled notifications.
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
	await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Gets all currently scheduled notifications.
 *
 * @returns Promise<Notifications.NotificationRequest[]> - Array of scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<
	Notifications.NotificationRequest[]
> {
	return await Notifications.getAllScheduledNotificationsAsync();
}
