import 'dotenv/config'

const APP_ENV = process.env.APP_ENV || 'dev'

const getEnvConfig = (env) => {
	switch (env) {
		case 'prod':
			return {
				name: 'Ukki',
				bundleIdentifier: 'com.ukki.customer',
				package: 'com.ukki.customer',
				scheme: 'ukki',
				updateChannel: 'production',
				apiUrl: process.env.API_URL,
			}
		case 'stage':
			return {
				name: 'Ukki Stage',
				bundleIdentifier: 'com.ukki.customer.stage',
				package: 'com.ukki.customer.stage',
				scheme: 'ukki-stage',
				updateChannel: 'stage',
				apiUrl: process.env.API_URL,
			}
		default:
			return {
				name: 'Ukki Dev',
				bundleIdentifier: 'com.ukki.customer.dev',
				package: 'com.ukki.customer.dev',
				scheme: 'ukki-dev',
				updateChannel: 'dev',
				apiUrl: process.env.API_URL,
			}
	}
}

const envConfig = getEnvConfig(APP_ENV)

export default {
	expo: {
		name: envConfig.name,
		slug: 'Ukki',
		version: '1.0.0',
		orientation: 'portrait',
		icon: './assets/images/icon.png',
		scheme: envConfig.scheme,
		userInterfaceStyle: 'automatic',
		newArchEnabled: true,
		ios: {
			supportsTablet: true,
			bundleIdentifier: envConfig.bundleIdentifier,
		},
		android: {
			adaptiveIcon: {
				backgroundColor: '#E6F4FE',
				foregroundImage: './assets/images/android-icon-foreground.png',
				backgroundImage: './assets/images/android-icon-background.png',
				monochromeImage: './assets/images/android-icon-monochrome.png',
			},
			edgeToEdgeEnabled: true,
			predictiveBackGestureEnabled: false,
			package: envConfig.package,
		},
		web: {
			output: 'static',
			favicon: './assets/images/favicon.png',
		},
		plugins: [
			'expo-router',
			[
				'expo-splash-screen',
				{
					image: './assets/images/splash-icon.png',
					imageWidth: 200,
					resizeMode: 'contain',
					backgroundColor: '#ffffff',
					dark: {
						backgroundColor: '#000000',
					},
				},
			],
			[
				'expo-notifications',
				{
					icon: './assets/images/icon.png',
					color: '#ffffff',
					defaultChannel: 'default',
				},
			],
			["@sentry/react-native/expo"]
		],
		experiments: {
			typedRoutes: true,
			reactCompiler: true,
		},
		updates: {
			url: 'https://u.expo.dev/f66ce6d5-08aa-4b25-b964-c67d735bb334', 
			enabled: true,
			checkAutomatically: 'ON_APP_RESUME',
			fallbackToCacheTimeout: 0,
		},
		runtimeVersion: {
			policy: 'appVersion',
		},
		extra: {
			APP_ENV,
			API_URL: envConfig.apiUrl,
			eas: {
				projectId: 'f66ce6d5-08aa-4b25-b964-c67d735bb334'
			},
		},
	},
}
