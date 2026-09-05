import { Autocomplete, TextField } from '@mui/material'

interface ConversionsProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

const Conversions = ({
  value,
  onChange,
  disabled,
}: ConversionsProps) => {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={value}
      disabled={disabled}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Conversões"
          placeholder="Digite e pressione Enter"
        />
      )}
    />
  )
}

export default Conversions