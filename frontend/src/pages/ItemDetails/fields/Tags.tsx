import { Autocomplete, TextField } from '@mui/material'

interface TagsProps {
  value: string[]
  onChange: (value: string[]) => void
}

const Tags = ({
  value,
  onChange,
}: TagsProps) => {
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
          label="Tags"
          placeholder="Digite ou selecione tags"
        />
      )}
    />
  )
}

export default Tags
