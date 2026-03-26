import { usePostHog } from 'posthog-react-native'
import { useEffect } from 'react'

export function usePostHogService() {
	const posthog = usePostHog()

	useEffect(() => {
		posthog.onFeatureFlags(() => {
			console.log('==== Feature flags loaded')
		})
	}, [posthog])
}
