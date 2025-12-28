import { Autocomplete, TextField } from '@mui/material'

const Tags = ({ value, onChange }) => {
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
          label="Tags"
          placeholder="Digite ou selecione tags"
        />
      )}
    />
  )
}

export default Tags
