import { useState } from 'react'
import { Box, Drawer, Typography, IconButton, Divider, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  cart: any
}

export const CartDrawer = ({ open, onClose, cart }: CartDrawerProps) => {
  const queryClient = useQueryClient()
  const [paymentMethod, setPaymentMethod] = useState('dinheiro')

  const { mutate: updateQuantity } = useMutation({
    mutationFn: async ({ itemId, quantity, cartId }: any) => {
      await api.post('api/cart/set_quantity/', { item_id: itemId, quantity, cart_id: cartId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const { mutate: checkout, isPending: isCheckingOut } = useMutation({
    mutationFn: async () => {
      await api.post('api/cart/checkout/', { payment_method: paymentMethod })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      onClose()
    },
  })

  const total = cart?.items?.reduce((acc: number, item: any) => acc + (Number(item.sell_price) * item.quantity), 0) || 0

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Carrinho</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {cart?.items?.length === 0 && <Typography color="text.secondary">O carrinho está vazio.</Typography>}
          {cart?.items?.map((item: any) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="bold">{item.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  R$ {Number(item.sell_price).toFixed(2)} un.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => updateQuantity({ itemId: item.item, quantity: item.quantity - 1, cartId: cart.id })}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2">{item.quantity}</Typography>
                <IconButton size="small" onClick={() => updateQuantity({ itemId: item.item, quantity: item.quantity + 1, cartId: cart.id })}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Forma de Pagamento</InputLabel>
          <Select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            label="Forma de Pagamento"
          >
            <MenuItem value="dinheiro">Dinheiro</MenuItem>
            <MenuItem value="pix">PIX</MenuItem>
            <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
            <MenuItem value="cartao_debito">Cartão de Débito</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontWeight: 'bold' }}>
          <Typography>Total:</Typography>
          <Typography>R$ {total.toFixed(2)}</Typography>
        </Box>

        <Button 
          variant="contained" 
          fullWidth 
          disabled={!cart?.items?.length || isCheckingOut}
          onClick={() => checkout()}
        >
          {isCheckingOut ? 'Finalizando...' : 'Finalizar Pedido'}
        </Button>
      </Box>
    </Drawer>
  )
}