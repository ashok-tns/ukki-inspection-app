import { useRouter } from 'expo-router'
import { Alert } from 'react-native'
import { useDeepLink } from '@/hooks/use-deep-link'

/**
 * Example hook showing how to handle deep links with custom logic.
 * This demonstrates handling notification deep links with additional data processing.
 *
 * Deep link formats supported:
 * - ukki://notifications
 * - ukki://notifications?id=123&type=message
 * - ukki://product/123
 * - ukki://profile?userId=456
 */
export function useAppDeepLinks() {
	const router = useRouter()

	useDeepLink({
		onDeepLink: async (data) => {
			console.log('Processing deep link:', data)

			// Handle notification deep links
			if (data.path === '/notifications' || data.path === 'notifications') {
				const notificationId = data.queryParams.id
				const notificationType = data.queryParams.type

				if (notificationId) {
					// Example: Fetch notification details
					console.log(`Fetching notification ${notificationId} of type ${notificationType}`)

					// You can add custom logic here:
					// - Fetch data from API
					// - Update local state
					// - Show a modal
					// - Navigate to specific screen

					// Example: Show alert with notification info
					Alert.alert(
						'Deep Link Notification',
						`Opening notification ${notificationId} (${notificationType || 'default'})`,
					)

					// Navigate to notifications tab
					router.push('/notifications')
					return true // Handled
				}

				// No specific notification, just go to notifications tab
				router.push('/notifications')
				return true
			}

			// Handle product deep links
			if (data.path.startsWith('/product/') || data.path.startsWith('product/')) {
				const productId = data.path.split('/').pop()
				console.log(`Opening product ${productId}`)

				// Example: Fetch product and navigate
				// await fetchProduct(productId)
				// router.push(`/product/${productId}`)

				Alert.alert('Deep Link Product', `Would open product ${productId}`)
				return true // Handled
			}

			// Handle profile deep links
			if (data.path === '/profile' || data.path === 'profile') {
				const userId = data.queryParams.userId

				if (userId) {
					console.log(`Opening profile for user ${userId}`)
					// router.push(`/profile/${userId}`)
					Alert.alert('Deep Link Profile', `Would open profile for user ${userId}`)
					return true
				}
			}

			// Not handled by this hook, let default navigation happen
			return false
		},
	})
}
