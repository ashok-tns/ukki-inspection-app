import * as Linking from 'expo-linking'
import { usePathname, useRouter, useSegments } from 'expo-router'
import { useEffect, useRef } from 'react'

export interface DeepLinkData {
	url: string
	path: string
	queryParams: Record<string, string>
	hostname?: string
	scheme?: string
}

export interface DeepLinkHandler {
	/**
	 * Callback function to handle deep link data
	 * Return true if the link was handled, false otherwise
	 */
	onDeepLink: (data: DeepLinkData) => boolean | Promise<boolean>
	/**
	 * Optional: Filter to only handle specific paths
	 * If provided, onDeepLink will only be called for matching paths
	 */
	pathFilter?: string | string[] | ((path: string) => boolean)
}

/**
 * Custom hook for handling deep links in the app.
 * Integrates with expo-router for automatic navigation.
 *
 * @param handler - Optional handler for custom deep link processing
 * @returns Object with current deep link data and utility functions
 *
 * @example
 * ```tsx
 * // Basic usage - automatic navigation
 * useDeepLink()
 *
 * // Custom handler with navigation
 * useDeepLink({
 *   onDeepLink: async (data) => {
 *     if (data.path === '/product') {
 *       const productId = data.queryParams.id
 *       // Fetch product data, then navigate
 *       await fetchProduct(productId)
 *       router.push(`/product/${productId}`)
 *       return true // Handled
 *     }
 *     return false // Not handled, use default navigation
 *   }
 * })
 *
 * // Filter specific paths
 * useDeepLink({
 *   pathFilter: ['/notifications', '/profile'],
 *   onDeepLink: (data) => {
 *     console.log('Notification or profile deep link:', data)
 *     return false // Let expo-router handle navigation
 *   }
 * })
 * ```
 */
export function useDeepLink(handler?: DeepLinkHandler) {
	const router = useRouter()
	const pathname = usePathname()
	const segments = useSegments()
	const lastUrlRef = useRef<string | null>(null)

	// biome-ignore lint/correctness/useExhaustiveDependencies: <eslint-disable>
	useEffect(() => {
		// Get initial URL when app is opened via deep link
		Linking.getInitialURL().then((url) => {
			if (url) {
				handleDeepLink(url)
			}
		})

		// Listen for deep links while app is running
		const subscription = Linking.addEventListener('url', ({ url }) => {
			handleDeepLink(url)
		})

		return () => {
			subscription.remove()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleDeepLink = async (url: string) => {
		// Avoid processing the same URL twice
		if (url === lastUrlRef.current) {
			return
		}
		lastUrlRef.current = url

		const parsed = Linking.parse(url)
		const deepLinkData: DeepLinkData = {
			url,
			path: parsed.path || '/',
			queryParams: (parsed.queryParams as Record<string, string>) || {},
			hostname: parsed.hostname ?? undefined,
			scheme: parsed.scheme ?? undefined,
		}

		console.log('Deep link received:', deepLinkData)

		// Check if path matches filter
		if (handler?.pathFilter) {
			const shouldHandle = matchesFilter(deepLinkData.path, handler.pathFilter)
			if (!shouldHandle) {
				// Path doesn't match filter, use default navigation
				navigateToPath(deepLinkData)
				return
			}
		}

		// Call custom handler if provided
		if (handler?.onDeepLink) {
			try {
				const handled = await handler.onDeepLink(deepLinkData)
				if (handled) {
					// Handler processed the link, don't do default navigation
					return
				}
			} catch (error) {
				console.error('Error in deep link handler:', error)
			}
		}

		// Default behavior: navigate using expo-router
		navigateToPath(deepLinkData)
	}

	const navigateToPath = (data: DeepLinkData) => {
		try {
			// Build the full path with query params
			const queryString = Object.keys(data.queryParams)
				.map((key) => `${key}=${encodeURIComponent(data.queryParams[key])}`)
				.join('&')

			const fullPath = queryString ? `${data.path}?${queryString}` : data.path

			// Use expo-router to navigate
			// ts-expect-error - expo-router types don't support dynamic paths
			router.push(fullPath)
		} catch (error) {
			console.error('Error navigating to deep link path:', error)
		}
	}

	const matchesFilter = (
		path: string,
		filter: string | string[] | ((path: string) => boolean),
	): boolean => {
		if (typeof filter === 'function') {
			return filter(path)
		}
		if (typeof filter === 'string') {
			return path === filter || path.startsWith(`${filter}/`)
		}
		if (Array.isArray(filter)) {
			return filter.some((f) => path === f || path.startsWith(`${f}/`))
		}
		return false
	}

	return {
		currentPath: pathname,
		currentSegments: segments,
		/**
		 * Manually trigger a deep link
		 */
		openDeepLink: (url: string) => {
			handleDeepLink(url)
		},
		/**
		 * Get the app's deep link URL for a given path
		 */
		createDeepLink: (path: string, params?: Record<string, string>) => {
			const queryString = params
				? `?${Object.keys(params)
						.map((key) => `${key}=${encodeURIComponent(params[key])}`)
						.join('&')}`
				: ''
			return `ukki://${path}${queryString}`
		},
	}
}

/**
 * Parse a deep link URL into its components
 */
export function parseDeepLink(url: string): DeepLinkData | null {
	try {
		const parsed = Linking.parse(url)
		return {
			url,
			path: parsed.path || '/',
			queryParams: (parsed.queryParams as Record<string, string>) || {},
			hostname: parsed.hostname ?? undefined,
			scheme: parsed.scheme ?? undefined,
		}
	} catch (error) {
		console.error('Error parsing deep link:', error)
		return null
	}
}
