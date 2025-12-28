import Button from '@mui/material/Button';

export default function FormButton(props) {
  const { label, type = "button", ...rest } = props

  return (
    <Button
      type={type}
      variant="contained"
      className={"myForm"}
      {...rest}
    >
      {label}
    </Button>
  )
}
