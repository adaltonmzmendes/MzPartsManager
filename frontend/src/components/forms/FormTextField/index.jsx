import TextField from '@mui/material/TextField'
import { Controller } from 'react-hook-form'

export default function FormTextField(props) {
  const { label, name, control } = props

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, formState: { errors } }) => {
        const error = errors?.[name]

        return (
          <TextField
            {...field}
            label={label}
            variant="outlined"
            className="myForm"
            error={!!error}
            helperText={error?.message}
            value={field.value ?? ""} // 🔒 proteção extra
          />
        )
      }}
    />
  )
}
