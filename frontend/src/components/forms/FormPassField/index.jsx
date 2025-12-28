import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { FormHelperText } from '@mui/material'
import { Controller } from 'react-hook-form'

export default function FormPassField(props) {
  const [showPassword, setShowPassword] = React.useState(false)
  const { label, name, control } = props

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""              // 🔴 OBRIGATÓRIO
      render={({ field, formState: { errors } }) => {
        const error = errors?.[name]

        return (
          <FormControl
            variant="outlined"
            className="myForm"
            error={!!error}
          >
            <InputLabel>{label}</InputLabel>

            <OutlinedInput
              {...field}
              type={showPassword ? 'text' : 'password'}
              value={field.value ?? ""}   // 🔒 NUNCA undefined
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label={label}
            />

            <FormHelperText>{error?.message}</FormHelperText>
          </FormControl>
        )
      }}
    />
  )
}
