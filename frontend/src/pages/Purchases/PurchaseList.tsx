import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout'
import AssignmentIcon from '@mui/icons-material/Assignment'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/services/api'
import { PageHeader } from '@/components/PageHeader'

const formatCurrency = (val: number | string) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val))
}

const PurchaseList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [supplierId, setSupplierId] = useState<string>('')
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const { data: purchase } = useQuery({
    queryKey: ['purchaseCart'],
    queryFn: async () => {
      const res = await api.get('api/purchases/')
      return res.data[0] || { items: [] }
    },
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await api.get('api/crm/contacts/', { params: { is_supplier: true } })
      return res.data.results || res.data
    }
  })

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity, unitCost }: { itemId: number, quantity: number, unitCost: number }) => {
      await api.post('api/purchases/update_item/', { item_id: itemId, quantity, unit_cost: unitCost })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseCart'] })
  })

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('api/purchases/checkout/', { supplier_id: supplierId || null })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseCart'] })
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
      setSupplierId('')
      setSnackbar({ open: true, message: 'Compra finalizada com sucesso! Estoque atualizado.', severity: 'success' })
      setTimeout(() => navigate('/purchases'), 2000)
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Erro ao finalizar a compra.', severity: 'error' })
    }
  })

  const handleUpdate = (itemId: number, quantity: number, unitCost: number) => {
    updateItemMutation.mutate({ itemId, quantity, unitCost })
  }

  const hasItems = purchase?.items && purchase.items.length > 0

  return (
    <Box>
      <PageHeader 
        title="Lista de Compras" 
        subtitle="Conferência e Finalização" 
        icon={AssignmentIcon}
        color="warning" 
      />

      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/purchases')}
          color="inherit"
        >
          Voltar para Compras
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell><strong>Produto</strong></TableCell>
              <TableCell align="center" width={150}><strong>Quantidade</strong></TableCell>
              <TableCell align="center" width={200}><strong>Custo Unit.</strong></TableCell>
              <TableCell align="right" width={150}><strong>Total</strong></TableCell>
              <TableCell align="center" width={80}><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hasItems ? (
              purchase.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      defaultValue={item.quantity}
                      onBlur={(e) => handleUpdate(item.item, Number(e.target.value), item.unit_cost)}
                      inputProps={{ min: 1 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      defaultValue={item.unit_cost}
                      onBlur={(e) => handleUpdate(item.item, item.quantity, Number(e.target.value))}
                      inputProps={{ step: "0.01", min: 0 }}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.quantity * item.unit_cost)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleUpdate(item.item, 0, item.unit_cost)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">A lista de compras está vazia.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasItems && (
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, ml: 'auto' }}>
          <TextField
            select
            label="Fornecedor (Opcional)"
            fullWidth
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            <MenuItem value=""><em>Nenhum</em></MenuItem>
            {suppliers?.map((sup: any) => (
              <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
            <Typography variant="h6">Total da Compra:</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {formatCurrency(purchase.total_value || 0)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="warning"
            size="large"
            startIcon={<ShoppingCartCheckoutIcon />}
            disabled={checkoutMutation.isPending}
            onClick={() => checkoutMutation.mutate()}
          >
            {checkoutMutation.isPending ? 'Processando...' : 'Finalizar Compra e Atualizar Estoque'}
          </Button>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default PurchaseList