import TextField from '@mui/material/TextField'
import { Controller, type Control, type FieldValues } from 'react-hook-form'

/* ===========================
   TYPES
=========================== */
interface FormTextFieldProps<T extends FieldValues = FieldValues> {
  label: string
  name: string
  control: Control<T>
}

/* ===========================
   COMPONENT
=========================== */
const FormTextField = <T extends FieldValues = FieldValues>({
  label,
  name,
  control,
}: FormTextFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue="" // 🔴 obrigatório no RHF
      render={({ field, formState: { errors } }) => {
        const error = errors?.[name]

        return (
          <TextField
            {...field}
            label={label}
            variant="outlined"
            className="myForm"
            error={!!error}
            helperText={error?.message as string}
            value={field.value ?? ''} // 🔒 nunca undefined
            fullWidth
          />
        )
      }}
    />
  )
}

export default FormTextField
