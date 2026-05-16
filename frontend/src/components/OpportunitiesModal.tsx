import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

interface OpportunitiesModalProps {
  open: boolean
  onClose: () => void
  initialProductName?: string
}

const REASONS = [
  { value: 'falta_estoque', label: 'Falta de estoque' },
  { value: 'nao_trabalhado', label: 'Produto não trabalhado' },
  { value: 'preco_elevado', label: 'Preço elevado' },
  { value: 'prazo_entrega', label: 'Prazo de entrega' },
  { value: 'marca_qualidade', label: 'Marca/Qualidade' },
  { value: 'outro', label: 'Outro' },
]

export const OpportunitiesModal = ({ open, onClose, initialProductName = '' }: OpportunitiesModalProps) => {
  const queryClient = useQueryClient()
  
  const [productName, setProductName] = useState(initialProductName)
  const [prevInitial, setPrevInitial] = useState(initialProductName)
  const [reason, setReason] = useState('nao_trabalhado')
  const [quantity, setQuantity] = useState<number | string>(1)
  const [observation, setObservation] = useState('')

  if (initialProductName !== prevInitial) {
    setPrevInitial(initialProductName)
    setProductName(initialProductName)
  }

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('api/opportunities/lost-sales/', {
        product_name: productName,
        reason,
        quantity: Number(quantity),
        observation,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      handleClose()
    },
  })

  const handleClose = () => {
    setProductName('')
    setReason('nao_trabalhado')
    setQuantity(1)
    setObservation('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar Oportunidade</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Produto Buscado"
            fullWidth
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            autoFocus
          />
          
          <TextField
            select
            label="Motivo da Oportunidade"
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REASONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantidade Desejada"
            type="number"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Observação (Opcional)"
            multiline
            rows={3}
            fullWidth
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button 
          onClick={() => mutation.mutate()} 
          variant="contained" 
          color="primary"
          disabled={!productName || !quantity || mutation.isPending}
        >
          {mutation.isPending ? 'Salvando...' : 'Registrar Oportunidade'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}