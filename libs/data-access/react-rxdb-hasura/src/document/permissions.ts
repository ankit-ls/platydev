import { useEffect, useState } from 'react'

import { ContentsDocument, canEdit, canDelete } from '@platyplus/rxdb-hasura'

import { useDocumentMetadata } from './metadata'

export const useDocumentPermissions = (document?: ContentsDocument) => {
  const [edit, setEdit] = useState(false)
  const [remove, setRemove] = useState(false)
  const metadata = useDocumentMetadata(document)
  // TODO implement canSave
  useEffect(() => {
    if (document) {
      setEdit(canEdit(document))
      setRemove(canDelete(document))
    }
  }, [document, metadata])
  return { edit, remove }
}