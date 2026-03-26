import Constants from 'expo-constants'

export type AppEnv = 'dev' | 'stage' | 'prod'

export interface AppConfig {
	APP_ENV: AppEnv
	API_URL: string
	IS_DEV: boolean
	IS_STAGE: boolean
	IS_PROD: boolean
}

const getAppConfig = (): AppConfig => {
	const extra = Constants.expoConfig?.extra || {}
	const APP_ENV = (extra.APP_ENV as AppEnv) || 'dev'

	return {
		APP_ENV,
		API_URL: extra.API_URL || '',
		IS_DEV: APP_ENV === 'dev',
		IS_STAGE: APP_ENV === 'stage',
		IS_PROD: APP_ENV === 'prod',
	}
}

export const ENV = getAppConfig()
