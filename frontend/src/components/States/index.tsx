import { Box, CircularProgress, Typography } from '@mui/material'

export const LoadingState = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
)

export const ErrorState = ({ message = "Erro ao carregar itens." }: { message?: string }) => (
  <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
    <Typography>{message}</Typography>
  </Box>
)