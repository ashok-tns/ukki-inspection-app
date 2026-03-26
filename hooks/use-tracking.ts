import type { PostHogEventProperties } from '@posthog/core'
import { usePostHog } from 'posthog-react-native'
import { useCallback } from 'react'

export const useTracking = () => {
	const posthog = usePostHog()

	const trackEvent = useCallback(
		(event: string, properties?: PostHogEventProperties) => {
			posthog.capture(event, properties)
		},
		[posthog],
	)

	const trackScreenView = useCallback(
		(screenName: string) => {
			trackEvent(`${screenName} screen visited`)
		},
		[trackEvent],
	)

	return {
		trackEvent,
		trackScreenView,
	}
}
