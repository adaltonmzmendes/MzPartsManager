import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import { Controller, type Control, type FieldValues } from 'react-hook-form'

/* ===========================
   TYPES
=========================== */
interface FormPassFieldProps<T extends FieldValues = FieldValues> {
  label: string
  name: string
  control: Control<T>
}

/* ===========================
   COMPONENT
=========================== */
const FormPassField = <T extends FieldValues = FieldValues>({
  label,
  name,
  control,
}: FormPassFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue="" // 🔴 obrigatório no RHF
      render={({ field, formState: { errors } }) => {
        const error = errors?.[name]

        return (
          <FormControl
            variant="outlined"
            className="myForm"
            error={!!error}
            fullWidth
          >
            <InputLabel>{label}</InputLabel>

            <OutlinedInput
              {...field}
              type={showPassword ? 'text' : 'password'}
              value={field.value ?? ''} // 🔒 nunca undefined
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword
                      ? <VisibilityOff />
                      : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label={label}
            />

            <FormHelperText>
              {error?.message as string}
            </FormHelperText>
          </FormControl>
        )
      }}
    />
  )
}

export default FormPassField
