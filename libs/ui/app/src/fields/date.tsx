import { UI_DATE_FORMAT } from '../config'
import { DatePickerAccepter, FieldControl, FieldComponent } from './utils'

export const DateField: FieldComponent = ({
  document,
  name,
  edit,
  editable
}) => {
  if (editable || edit)
    return (
      <FieldControl
        name={name}
        readOnly={!edit}
        cleanable={edit}
        format={UI_DATE_FORMAT}
        date={true}
        time={false}
        accepter={DatePickerAccepter}
      />
    )
  else return document[name] || null
}
