import { isRxDocument, RxDocument } from 'rxdb'
import { DeepReadonly } from 'rxdb/dist/types/types'
import clone from 'clone-deep'
import { DocumentNode } from 'graphql'
import decode from 'jwt-decode'

import { jsonataPaths } from '@platyplus/jsonata-schema'

import { Contents, ContentsCollection, ContentsDocument } from './types'

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export type FieldMapItem = FieldMap | true
export interface FieldMap {
  [key: string]: FieldMapItem
}

export const metadataName = (data: { schema: string; name: string }): string =>
  data.schema === 'public' ? `${data.name}` : `${data.schema}_${data.name}`

export const collectionName = (
  metadata: { schema: string; name: string },
  role: string
) => `${role}_${metadataName(metadata)}`

// * Generate query fields according to the loaded schema
// * It is meant to:
// * - avoid sending the details of GraphQL JSON fields
// * - systematically add default fields of properties (primary key and `deleted`)
const generateRxdbJsonataPaths = (
  schema: FieldMap,
  collection?: ContentsCollection
): FieldMap => {
  const subFields = Object.entries(schema).reduce<FieldMap>(
    (aggr, [key, value]) => {
      const ref = collection?.schema.jsonSchema.properties[key].ref
      if (collection && ref) {
        if (value === true) {
          aggr[key] = { [collection.schema.primaryPath]: true, deleted: true }
        } else
          aggr[key] = generateRxdbJsonataPaths(value, collection?.database[ref])
      } else aggr[key] = true

      return aggr
    },
    {}
  )
  return subFields
}

export const rxdbJsonataPaths = (
  expression: string,
  collection: ContentsCollection
): FieldMap => generateRxdbJsonataPaths(jsonataPaths(expression), collection)

type Claims = Record<string, unknown> & {
  ['https://hasura.io/jwt/claims']: HasuraClaims
}
type HasuraClaims = {
  [key: string]: string | string[] | undefined
  'x-hasura-allowed-roles': string[]
  'x-hasura-default-role': string
}

export const hasuraClaims = (token: string): HasuraClaims =>
  decode<Claims>(token)['https://hasura.io/jwt/claims']

export const createHeaders = (
  role: string,
  token?: string,
  substituteRole?: string
): Record<string, string> => {
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    const hasura = hasuraClaims(token)
    const allowedRoles = hasura['x-hasura-allowed-roles']
    const defaultRole = hasura['x-hasura-default-role']
    if (substituteRole && allowedRoles.includes(substituteRole))
      headers['x-hasura-role'] = substituteRole
    else if (role !== defaultRole && allowedRoles.includes(role))
      headers['x-hasura-role'] = role
  }
  return headers
}

export const queryToSubscription = (query: DocumentNode): DocumentNode => {
  const result: typeof query = clone(query)
  result.definitions.forEach((definition) => {
    if (definition.kind === 'OperationDefinition') {
      ;(definition.operation as string) = 'subscription'
    }
  })
  return result
}

export const documentContents = <T>(doc: T | RxDocument<T>): DeepReadonly<T> =>
  isRxDocument(doc) ? (doc as RxDocument<T>).toJSON() : (doc as DeepReadonly<T>)

export const populateDocument = async (
  doc: ContentsDocument
): Promise<Contents> => {
  const result = clone(doc)
  for (const field of doc.collection.schema.topLevelFields) {
    if (doc.collection.schema.jsonSchema.properties[field].ref) {
      const population = await doc.populate(field)
      result[field] =
        population &&
        (Array.isArray(population)
          ? population.map((item) => item.toJSON())
          : population.toJSON())
    }
  }
  return result
}
