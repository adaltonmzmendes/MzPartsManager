import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'

const ItemInfoHeader = ({ onClose, onSave }) => (
  <AppBar sx={{ position: 'relative' }}>
    <Toolbar sx={{ position: 'relative' }}>
      <IconButton edge="start" color="inherit" onClick={onClose}>
        <CloseIcon />
      </IconButton>

      <Typography
        variant="h6"
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        Informações do item
      </Typography>

      <Box sx={{ flexGrow: 1 }} />

      <Button color="inherit" onClick={onSave}>
        Salvar
      </Button>
    </Toolbar>
  </AppBar>
)

export default ItemInfoHeader
