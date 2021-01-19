import { PrimaryProperty, TopLevelProperty } from 'rxdb/dist/types/types'

import { info } from '../console'
import { createContentReplicator, createHooks } from '../contents'
import { ContentsCollection } from '../types'
import { hasuraCollections } from './helpers'
import { hasura } from './observables'

const compare = (a: number | undefined, b: number | undefined) => {
  return a || b ? (!a ? 1 : !b ? -1 : a - b) : 0
}

const collectionProperties = (
  collection: ContentsCollection
): Map<string, TopLevelProperty | PrimaryProperty> => {
  const schema = collection.schema
  const excludedProperties = [
    // * 'system' properties
    '_rev',
    '_attachments',
    'updated_at',
    'label',
    // * array aggregates from the property list
    ...collection.metadata.relationships
      .filter(({ rel_type }) => rel_type === 'array')
      .map(({ rel_name }) => `${rel_name}_aggregate`),
    // * primary key and other final fields as they can't be observed
    ...schema.finalFields.map(field => field)
  ]

  // * Return the collection properties, ordered from the propertiesConfig 'order' fields
  // ? somehow already ordered in the graphql query
  const configuredProperties = collection.metadata.propertiesConfig.reduce<
    Record<string, number>
  >((aggr, config) => ((aggr[config.property_name] = config.order), aggr), {})
  return new Map(
    Object.entries(schema.jsonSchema.properties)
      .filter(([name]) => !excludedProperties.includes(name))
      .sort(
        ([keyA], [keyB]) =>
          compare(configuredProperties[keyA], configuredProperties[keyB]) ||
          keyA.localeCompare(keyB)
      )
  )
}

export const createRxCollection = async (
  collection: ContentsCollection
): Promise<void> => {
  if (collection.options.metadata) {
    collection.metadata = collection.options.metadata
    collection.properties = collectionProperties(collection)
    await createContentReplicator(collection)
    info(`create RxCollection ${collection.name}`)
    createHooks(collection)
    hasura.next({
      ...hasuraCollections(collection.database),
      [collection.name]: collection
    })
  }
}