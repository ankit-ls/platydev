import produce from 'immer'
import create from 'zustand/vanilla'
import { devtools } from 'zustand/middleware'

import { ContentsCollection, ContentsDocument } from '../types'
import { AppConfig, Metadata } from './types'
import { ConfigCollectionName, CONFIG_TABLES } from './config'

export type MetadataStore = {
  tables: Record<string, Metadata>
  app?: AppConfig
  ready: Record<ConfigCollectionName | 'metadata', boolean>
  jwt?: string
  connected: boolean
  isReady: () => boolean
  isConfigReady: () => boolean
  syncing: boolean
}

export const metadataStore = create<MetadataStore>(
  devtools(
    (set, get) => ({
      tables: {},
      app: null,
      jwt: null,
      ready: {
        app_config: false,
        table_config: false,
        property_config: false,
        metadata: false
      },
      connected: false,
      syncing: true,
      isReady: () => Object.values(get().ready).every((value) => value),
      isConfigReady: () => CONFIG_TABLES.every((value) => get().ready[value])
    }),
    'metadata'
  )
)

export const getMetadataTable = (id?: string) =>
  metadataStore.getState().tables[id]

export const getCollectionMetadata = (collection: ContentsCollection) =>
  getMetadataTable(collection.tableId)

export const getDocumentMetadata = (document: ContentsDocument) =>
  getCollectionMetadata(document.collection)

export const setCollectionIsReady = (
  collectionName: ConfigCollectionName | 'metadata'
) => {
  metadataStore.setState(
    produce<MetadataStore>((state) => {
      state.ready[collectionName] = true
    })
  )
}
export const isMetadataReady = () =>
  Object.values(metadataStore.getState().tables).every((value) => value)

export const getJwt = () => metadataStore.getState().jwt

export const setAuthStatus = (status: boolean, jwt?: string) =>
  metadataStore.setState(
    produce<MetadataStore>((partial) => {
      partial.connected = status
      partial.jwt = jwt
    })
  )
