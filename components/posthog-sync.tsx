import { usePostHogService } from '../hooks/use-post-hog-service'

export function PostHogSync() {
	usePostHogService()
	return null
}
