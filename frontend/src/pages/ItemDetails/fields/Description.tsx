import { TextField } from '@mui/material'

interface DescriptionProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  helperText?: string
}

const Description = ({
  value,
  onChange,
  disabled,
  error,
  helperText,
}: DescriptionProps) => {
  return (
    <TextField
      label="Descrição do Item"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      required
      disabled={disabled}
      error={error}
      helperText={helperText}
    />
  )
}

export default Description