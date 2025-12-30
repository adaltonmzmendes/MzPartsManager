import { Box } from '@mui/material'

interface MyMessageProps {
  text: string
  color: string
}

const MyMessage = ({ text, color }: MyMessageProps) => {
  return (
    <Box
      sx={{
        backgroundColor: color,
        color: '#FFFFFF',
        width: '90%',
        height: '40px',
        position: 'absolute',
        top: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '4px',
      }}
    >
      {text}
    </Box>
  )
}

export default MyMessage
