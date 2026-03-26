import { usePostHog } from 'posthog-react-native'

export function useFeatureFlags(): { isFeatureEnabled: (flag: string) => boolean } {
	const posthog = usePostHog()

	/**
	 *
	 * @param flag Usage
	 * const { isFeatureEnabled } = useFeatureFlags()
	 * const isMyFlagEnabled = isFeatureEnabled('enable_offline_test')
	 * @returns boolean
	 */
	const isFeatureEnabled = (flag: string): boolean => {
		if (posthog.isFeatureEnabled(flag)) {
			return true
		}
		return false
	}

	return {
		isFeatureEnabled,
	}
}
