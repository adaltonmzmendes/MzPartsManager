import { Autocomplete, TextField } from '@mui/material'

interface ConversionsProps {
  value: string[]
  onChange: (value: string[]) => void
}

const Conversions = ({
  value,
  onChange,
}: ConversionsProps) => {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={value}
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
