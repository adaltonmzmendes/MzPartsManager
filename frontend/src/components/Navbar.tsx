import { ReactNode, useState } from 'react'
import { styled, useTheme } from '@mui/material/styles'
import {
  Box,
  Drawer,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  ClickAwayListener
} from '@mui/material'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HomeIcon from '@mui/icons-material/Home'
import LogoutIcon from '@mui/icons-material/Logout'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ArchiveIcon from '@mui/icons-material/Archive'
import ReceiptIcon from '@mui/icons-material/Receipt'

import api from '@/services/api'
import { CartDrawer } from '@/components/CartDrawer'

interface NavbarProps {
  content: ReactNode
}

interface AppBarStyledProps extends MuiAppBarProps {
  open?: boolean
}

interface MainProps {
  open?: boolean
}

const drawerWidth = 240

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})<MainProps>(({ theme, open }) => ({
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
}))

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarStyledProps>(({ theme, open }) => ({
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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}))

export default function Navbar({ content }: NavbarProps) {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('api/cart/')
      return res.data[0] || { items: [] }
    },
  })

  const cartItemsCount = cartData?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0

  const logoutUser = async () => {
    try {
      await api.post('logout/')
    } finally {
      localStorage.removeItem('Token')
      navigate('/')
    }
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" open={open}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton
              id="navbar-menu-button"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(true)}
              edge="start"
              sx={{ mr: 2, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 600, textAlign: 'center' }}
          >
            MzPartsManager
          </Typography>

          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {path === '/home' && (
              <IconButton color="inherit" onClick={() => setCartOpen(true)}>
                <Badge badgeContent={cartItemsCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <ClickAwayListener 
        onClickAway={(e) => {
          if ((e.target as HTMLElement).closest('#navbar-menu-button')) return
          if (open) handleDrawerClose()
        }}
      >
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>

          <Divider />

          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/home" selected={path === '/home'} onClick={handleDrawerClose}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="Catálogo" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/purchases" selected={path === '/purchases'} onClick={handleDrawerClose}>
                <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                <ListItemText primary="Compras" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/transactions" selected={path === '/transactions'} onClick={handleDrawerClose}>
                <ListItemIcon><ReceiptIcon /></ListItemIcon>
                <ListItemText primary="Movimentações" />
              </ListItemButton>
            </ListItem>

             <ListItem disablePadding>
              <ListItemButton component={Link} to="/archived" selected={path === '/archived'} onClick={handleDrawerClose}>
                <ListItemIcon><ArchiveIcon /></ListItemIcon>
                <ListItemText primary="Arquivados" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={logoutUser}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
      </ClickAwayListener>

      <Main open={open}>
        <DrawerHeader />
        {content}
      </Main>

      <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cart={cartData} 
      />
    </Box>
  )
}