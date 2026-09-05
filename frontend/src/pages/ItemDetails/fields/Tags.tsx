import { Autocomplete, TextField } from '@mui/material'

interface TagsProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

const Tags = ({
  value,
  onChange,
  disabled,
}: TagsProps) => {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={value}
      disabled={disabled}
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