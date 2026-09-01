import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(8),
  opacity: 0.5,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}))