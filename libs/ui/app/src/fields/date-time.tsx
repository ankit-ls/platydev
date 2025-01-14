import { UI_DATE_TIME_FORMAT } from '../config'
import { DatePickerAccepter, FieldControl, FieldComponent } from './utils'

export const DateTimeField: FieldComponent = ({
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
        format={UI_DATE_TIME_FORMAT}
        date={true}
        time={true}
        accepter={DatePickerAccepter}
      />
    )
  else return document[name] || null
}
