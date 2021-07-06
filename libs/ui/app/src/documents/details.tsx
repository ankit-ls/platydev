import { ControlLabel, Form, FormGroup, HelpBlock } from 'rsuite'

import { DocumentComponent } from './types'
import { useGetForm, useSetForm } from '@platyplus/react-rxdb-hasura'
import { FieldComponentWrapper } from '../fields'

export const DocumentDetails: DocumentComponent = ({ document, edit }) => {
  const setForm = useSetForm()
  const formValues = useGetForm(document)
  if (document?.collection.properties)
    return (
      <Form
        formValue={formValues}
        onChange={(formValue) => {
          setForm(document, formValue)
        }}
        fluid
      >
        {[...document.collection.properties.keys()].map(
          (key) =>
            document[key] != null &&
            !Array.isArray(document[key]) && (
              <FormGroup key={key}>
                <ControlLabel>{key}</ControlLabel>
                <FieldComponentWrapper
                  document={document}
                  field={key}
                  edit={edit}
                  editable={true}
                />
                {edit && document.collection.properties.get(key).required && (
                  <HelpBlock>Required</HelpBlock>
                )}
              </FormGroup>
            )
        )}
      </Form>
    )
  else return null
}
