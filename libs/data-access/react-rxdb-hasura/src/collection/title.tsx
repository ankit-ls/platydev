import { InlineValue } from '@platyplus/layout'
import { Metadata, metadataName } from '@platyplus/rxdb-hasura'
import { useMemo } from 'react'

import { useMetadataConfig } from '../config'

export const useMetadataTitle = (metadata?: Metadata) => {
  const id = useMemo(() => metadata?.id, [metadata])
  const fallback = useMemo(() => metadata && metadataName(metadata), [metadata])
  return useMetadataConfig<string>(id, 'title', fallback)
}

export const CollectionTitle: React.FC<{
  metadata?: Metadata
  editable?: boolean
}> = ({ metadata, editable }) => {
  const [value, onChange] = useMetadataTitle(metadata)
  return <InlineValue editable={editable} value={value} onChange={onChange} />
}
