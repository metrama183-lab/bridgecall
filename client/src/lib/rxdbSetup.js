import { createRxDatabase } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

const MESSAGE_SCHEMA = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    patientId: { type: 'string', maxLength: 36 },
    doctorId: { type: 'string', maxLength: 36 },
    direction: { type: 'string', maxLength: 20 },
    audioBase64: { type: 'string' },
    transcriptOriginal: { type: 'string' },
    transcriptTranslated: { type: 'string' },
    languageDetected: { type: 'string', maxLength: 10 },
    latFuzzy: { type: 'number' },
    lngFuzzy: { type: 'number' },
    status: { type: 'string', maxLength: 20 },
    hopCount: { type: 'integer', minimum: 0, maximum: 100, multipleOf: 1 },
    createdAt: { type: 'string', maxLength: 30 },
    symptoms: { type: 'array', items: { type: 'string' } }
  },
  required: ['id', 'patientId', 'status', 'createdAt']
}

let db = null

export async function getDatabase() {
  if (db) return db

  db = await createRxDatabase({
    name: 'bridgecall',
    storage: getRxStorageDexie()
  })

  await db.addCollections({
    messages: { schema: MESSAGE_SCHEMA }
  })

  return db
}
