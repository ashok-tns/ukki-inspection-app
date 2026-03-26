import * as Notifications from 'expo-notifications'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PostHogProvider } from 'posthog-react-native'
import 'react-native-reanimated'
import { Provider as ReduxProvider } from 'react-redux'
import { PostHogSync } from '@/components/posthog-sync'
import { AuthProvider } from '@/provider/auth-provider'
import ErrorBoundary from '@/provider/error-boundary'
import { QueryProvider } from '@/provider/query-provider'
import { store } from '@/store'

// import * as Sentry from "@sentry/react-native";
// Sentry.init({
//   dsn: "https://8be94c41dbe34ce1b244935c68165eab@o481709.ingest.sentry.io/5530799",
//   debug: false,
//   integrations: [captureConsoleIntegration({ levels: ["error", "warn", "log"] })],
// })

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
})

export const unstable_settings = {
	anchor: '(tabs)',
}

export default function RootLayout() {
	return (
		<PostHogProvider
			apiKey="phc_v8juCCug9sojIwtZbFkai5R9nCuTZPgiqM5FmHDg5MW"
			options={{
				host: 'https://us.i.posthog.com',
				enableSessionReplay: true,
				featureFlagsRequestTimeoutMs: 10000,
				preloadFeatureFlags: true,
				sessionReplayConfig: {
					maskAllTextInputs: true,
					maskAllImages: true,
					captureLog: true,
					captureNetworkTelemetry: true,
					throttleDelayMs: 1000,
				},
				errorTracking: {
					autocapture: {
						uncaughtExceptions: true,
						unhandledRejections: true,
						console: ['error', 'warn'],
					},
				},
			}}
		>
			<PostHogSync />
			<ErrorBoundary>
				<ReduxProvider store={store}>
					<QueryProvider>
						<AuthProvider>
							<Stack>
								<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
								<Stack.Screen name="(auth)" options={{ headerShown: false }} />
							</Stack>
							<StatusBar style="auto" />
						</AuthProvider>
					</QueryProvider>
				</ReduxProvider>
			</ErrorBoundary>
		</PostHogProvider>
	)
}
