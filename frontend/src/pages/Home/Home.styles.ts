import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'

export const PageWrapper = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  paddingLeft: 16,
  paddingRight: 16,
}))

export const Content = styled(Box)(() => ({
  width: '100%',
  maxWidth: 1100,
}))

export const SearchField = styled(TextField)(() => ({
  backgroundColor: '#fff',
  borderRadius: 999,
  boxShadow: '0px 2px 10px rgba(0,0,0,0.15)',
  '& fieldset': {
    border: 'none',
  },
}))

export const ItemCard = styled(Box)(() => ({
  padding: 16,
  marginBottom: 16,
  backgroundColor: '#fff',
  borderRadius: 8,
  boxShadow: '0px 2px 8px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  transition: '0.2s',
  '&:hover': {
    boxShadow: '0px 4px 16px rgba(0,0,0,0.25)',
  },
}))
