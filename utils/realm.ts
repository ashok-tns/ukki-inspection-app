import { createRealmContext } from '@realm/react'
import { Inspection, MediaItem } from '../models/Inspection'

export const realmConfig: Realm.Configuration = {
	schema: [Inspection, MediaItem],
	schemaVersion: 1,
}

const { RealmProvider, useRealm, useQuery, useObject } = createRealmContext(realmConfig)

export { RealmProvider, useObject, useQuery, useRealm }

