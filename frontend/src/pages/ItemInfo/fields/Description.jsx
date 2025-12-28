import { TextField } from '@mui/material'

const Description = ({ value, onChange }) => {
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
