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
      onChange={(_, newValue) => {
        const splitValues = newValue
          .flatMap((v) => v.toLowerCase().split(/\s+/))
          .filter(Boolean)
          
        onChange(Array.from(new Set(splitValues)))
      }}
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