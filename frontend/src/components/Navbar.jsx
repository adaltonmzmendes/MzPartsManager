import * as React from 'react'
import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import MuiAppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'

import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HomeIcon from '@mui/icons-material/Home'
import InfoIcon from '@mui/icons-material/Info'
import LogoutIcon from '@mui/icons-material/Logout'

import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '@/services/api'

const drawerWidth = 240

/* ===========================
   MAIN (conteúdo)
=========================== */
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: `-${drawerWidth}px`,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: 0,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  })
)

/* ===========================
   APP BAR
=========================== */
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

/* ===========================
   DRAWER HEADER
=========================== */
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}))

/* ===========================
   NAVBAR
=========================== */
export default function Navbar({ content }) {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const [open, setOpen] = React.useState(false)

  const logoutUser = () => {
    AxiosInstance.post('logout/')
      .then(() => {
        localStorage.removeItem('Token')
        navigate('/')
      })
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* ===== APP BAR ===== */}
      <AppBar position="fixed" open={open}>
        <Toolbar>

          {/* ESQUERDA */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setOpen(true)}
              sx={{ ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* CENTRO */}
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            MzPartsManager
          </Typography>

          {/* DIREITA (espelho) */}
          <Box sx={{ flex: 1 }} />

        </Toolbar>
      </AppBar>

      {/* ===== DRAWER ===== */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === 'ltr'
              ? <ChevronLeftIcon />
              : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />

        <List>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/home"
              selected={path === '/home'}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/about"
              selected={path === '/about'}
            >
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Sobre nós" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={logoutUser}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>

        </List>
      </Drawer>

      {/* ===== CONTEÚDO ===== */}
      <Main open={open}>
        <DrawerHeader />
        {content}
      </Main>
    </Box>
  )
}
