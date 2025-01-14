import { useCallback, useMemo } from 'react'

import {
  Metadata,
  MetadataDocument,
  PropertyConfig,
  Property
} from '@platyplus/rxdb-hasura'

import { useCollectionTableConfig } from '../collection'
import { useMetadataStore } from '../metadata'
import { useStore } from '../store'

export const usePropertyConfig = <T = PropertyConfig>(
  metadata: Metadata | MetadataDocument | undefined,
  property: string,
  path?: string,
  fallback?: T
): [T, (val: T) => void] => {
  const id = useMemo(() => `${metadata.id}.${property}`, [metadata, property])

  const initialValues = useMetadataStore(
    useCallback(
      (state) =>
        state.tables[metadata.id].properties.get(property)?.config || {},
      [metadata, property]
    )
  )
  const modifiedValues = useStore(
    useCallback((state) => (id && state.forms.property_config[id]) || {}, [id])
  )
  const state = useMemo(() => {
    if (path) {
      return (
        (path in modifiedValues ? modifiedValues[path] : initialValues[path]) ||
        fallback
      )
    } else return { ...initialValues, ...modifiedValues }
  }, [modifiedValues, initialValues, path, fallback])
  const setState = useStore(
    useCallback(
      (state) => (value: T) =>
        state.setConfigForm('property_config', value, id, path),
      [path, id]
    )
  )
  return [state, setState]
}

export const useCollectionPropertyConfig = <T = PropertyConfig>(
  metadata: Metadata,
  property: string,
  path?: string,
  fallback?: T
) => {
  return usePropertyConfig(metadata, property, path, fallback)
}

export const useMetadataProperties = (
  metadata: Metadata,
  options?: { all?: boolean; role?: string; order?: boolean }
): [Map<string, Property>, (val: Map<string, Property>) => void] => {
  const state = useMemo(() => metadata.properties, [metadata])

  const [order, setOrder] = useCollectionTableConfig<string[]>(
    metadata.id,
    'order'
  )

  const properties = useMemo(() => {
    if (state) {
      const result = new Map<string, Property>()
      const tempProperties = new Map(state)
      if (options?.all !== true) {
        for (const id of ['id', 'updated_at', 'created_at', 'deleted']) {
          tempProperties.delete(id)
        }
      }
      if (options?.order !== false && order)
        for (const property of order) {
          result.set(property, tempProperties.get(property))
          tempProperties.delete(property)
        }
      return new Map([...result, ...tempProperties])
    } else return null
  }, [state, order, options])

  const setProperties = useCallback(
    (newProperties: Map<string, Property>) =>
      setOrder([...newProperties.keys()]),
    [setOrder]
  )

  return [properties, setProperties]
}
