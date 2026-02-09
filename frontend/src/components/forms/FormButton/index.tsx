import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'

interface FormButtonProps extends ButtonProps {
  label: string
}

const FormButton = ({
  label,
  type = 'button',
  ...rest
}: FormButtonProps) => {
  return (
    <Button
      type={type}
      variant="contained"
      className="myForm"
      {...rest}
    >
      {label}
    </Button>
  )
}

export default FormButton
