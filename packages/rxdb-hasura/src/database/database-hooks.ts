import { info } from '../console'
import { createMetadataReplicator, metadataSchema } from '../metadata'
import { Database } from '../types'
import { hasuraCollections } from './helpers'
import { hasura } from './observables'

export const createRxDatabase = async (db: Database): Promise<void> => {
  info(`Add metadata to RxDatabase ${db.name}`)
  await db.addCollections({
    metadata: {
      schema: metadataSchema,
      autoMigrate: true
    }
  })
  await createMetadataReplicator(db.metadata)
  hasura.next(hasuraCollections(db))
}