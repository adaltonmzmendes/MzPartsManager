import { TextField } from '@mui/material'

interface DescriptionProps {
  value: string
  onChange: (value: string) => void
}

const Description = ({
  value,
  onChange,
}: DescriptionProps) => {
  return (
    <TextField
      label="Descrição"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
    />
  )
}

export default Description
