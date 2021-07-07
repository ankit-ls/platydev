import { Loading } from '@platyplus/navigation'
import { useDocument } from '@platyplus/react-rxdb-hasura'
import { Contents } from '@platyplus/rxdb-hasura'
import { useMemo } from 'react'
import { FormControl, SelectPicker } from 'rsuite'
import { useRxQuery } from 'rxdb-hooks'
import { DocumentFromParamsComponentWrapper } from '../documents'
import { FieldComponent } from './types'

export const DocumentSelectSingleField: FieldComponent = ({
  document,
  field,
  edit,
  editable
}) => {
  // TODO async - see https://rsuitejs.com/components/select-picker/#Async
  const refCollectionName = document.collection.properties.get(field).ref
  const refCollection = document.collection.database[refCollectionName]
  const rxQuery = useMemo(() => refCollection?.find(), [refCollection])
  const { isFetching, result } = useRxQuery<Contents>(rxQuery)
  const options = result.map((doc) => ({ label: doc.label, value: doc.id }))
  const { isFetching: isFetchingDoc, document: refDocument } = useDocument(
    refCollectionName,
    document[field]
  )
  if (isFetching) return <Loading />
  if (editable || edit)
    return (
      <FormControl
        name={field}
        readOnly={!edit}
        accepter={(props) => (
          <SelectPicker data={options} cleanable={edit} {...props} />
        )}
      />
    )
  else if (isFetchingDoc) return <Loading />
  else
    return (
      <DocumentFromParamsComponentWrapper
        collectionName={refCollectionName}
        id={document[field]}
        componentName="label"
        edit={false}
      />
    )
}