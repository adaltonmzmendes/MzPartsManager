import { Autocomplete, TextField } from '@mui/material'

const Conversions = ({ value = [], onChange }) => {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={value}
      onChange={(e, newValue) => onChange(newValue)}
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
