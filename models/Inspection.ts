import { Realm } from '@realm/react'

export class MediaItem extends Realm.Object {
	id!: string
	localUri!: string
	type!: 'photo' | 'video'
	remoteUrl?: string
	isUploaded!: boolean

	static schema: Realm.ObjectSchema = {
		name: 'MediaItem',
		primaryKey: 'id',
		properties: {
			id: 'string',
			localUri: 'string',
			type: 'string',
			remoteUrl: 'string?',
			isUploaded: { type: 'bool', default: false },
		},
	}
}

export class Inspection extends Realm.Object {
	id!: string
	vendorId!: string
	carDetails!: string
	status!: 'pending' | 'syncing' | 'completed'
	media!: Realm.List<MediaItem>
	createdAt!: Date

	static schema: Realm.ObjectSchema = {
		name: 'Inspection',
		primaryKey: 'id',
		properties: {
			id: 'string',
			vendorId: 'string',
			carDetails: 'string', // JSON stringified
			status: { type: 'string', default: 'pending' },
			media: 'MediaItem[]',
			createdAt: 'date',
		},
	}
}
