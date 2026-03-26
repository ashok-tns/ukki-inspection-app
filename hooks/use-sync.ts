import * as Network from 'expo-network'
import { useEffect, useRef } from 'react'
import { Inspection, MediaItem } from '../models/Inspection'
import { useQuery, useRealm } from '../utils/realm'

export function useSync() {
	const realm = useRealm()
	const pendingMedia = useQuery(MediaItem, (media) => media.filtered('isUploaded == false'))
	const isSyncing = useRef(false)

	useEffect(() => {
		const syncData = async () => {
			if (isSyncing.current) return

			const networkState = await Network.getNetworkStateAsync()
			if (!networkState.isConnected || !networkState.isInternetReachable) {
				return
			}

			if (pendingMedia.length === 0) return

			isSyncing.current = true
			console.log(`Starting sync for ${pendingMedia.length} items...`)

			try {
				for (const item of pendingMedia) {
					// Dummy upload logic - replace with actual API call
					await uploadMedia(item)

					realm.write(() => {
						item.isUploaded = true
						item.remoteUrl = `https://cdn.ukki.customer/media/${item.id}`
					})
				}

				// Check if all media for an inspection are uploaded to mark it as completed
				const inspections = realm.objects(Inspection)
				for (const inspection of inspections) {
					const allUploaded = inspection.media.every((m) => m.isUploaded)
					if (allUploaded && inspection.status !== 'completed') {
						realm.write(() => {
							inspection.status = 'completed'
						})
					}
				}
			} catch (error) {
				console.error('Sync failed:', error)
			} finally {
				isSyncing.current = false
			}
		}

		// Sync on mount and then every time pendingMedia changes when online
		syncData()

		// Monitor network changes
		const interval = setInterval(syncData, 10000) // Polling as a fallback for expo-network

		return () => clearInterval(interval)
	}, [pendingMedia, realm])
}

// Mock upload function
async function uploadMedia(item: MediaItem) {
	console.log(`Uploading ${item.type}: ${item.localUri}`)
	return new Promise((resolve) => setTimeout(resolve, 2000))
}
