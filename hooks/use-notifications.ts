import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { registerForPushNotificationsAsync } from '@/utils/notifications'

/**
 * Custom hook for managing push notifications in the app.
 * Handles registration, listeners, and notification state.
 *
 * @returns Object containing push token, current notification, and last notification response
 */
export function useNotifications() {
	const [expoPushToken, setExpoPushToken] = useState<string>('')
	const [notification, setNotification] = useState<Notifications.Notification | undefined>(
		undefined,
	)
	const notificationResponse = Notifications.useLastNotificationResponse()

	useEffect(() => {
		// Register for push notifications and get the token
		registerForPushNotificationsAsync().then((token) => {
			if (token) {
				setExpoPushToken(token)
			}
		})

		// Listen for notifications received while app is foregrounded
		const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
			console.log('Notification received:', notification)
			setNotification(notification)
		})

		// Listen for notification responses (user tapped notification)
		const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
			console.log('Notification response:', response)
		})

		// Cleanup listeners on unmount
		return () => {
			notificationListener.remove()
			responseListener.remove()
		}
	}, [])

	return {
		expoPushToken,
		notification,
		notificationResponse,
	}
}
