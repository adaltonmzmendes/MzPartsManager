import { useState } from 'react'
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Select, MenuItem, FormControl, InputLabel, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ReceiptIcon from '@mui/icons-material/Receipt'
import api from '@/services/api'
import { PageHeader } from '@/components/PageHeader'

export default function TransactionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [localPaymentMethod, setLocalPaymentMethod] = useState<string | null>(null)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  const { data: transaction, isLoading, isError } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => (await api.get(`api/cart/${id}/`)).data,
    enabled: !!id,
    refetchInterval: (query: any) => {
      const status = query?.state?.data?.nfe_status || query?.nfe_status
      return status === 'processing' ? 3000 : false
    }
  })

  const effectivePaymentMethod = localPaymentMethod ?? transaction?.payment_method ?? ''

  const { mutate: issueNfce, isPending: isIssuing, error: issueError } = useMutation({
    mutationFn: async () => (await api.post(`api/cart/${id}/issue_nfce/`, { payment_method: effectivePaymentMethod }, { timeout: 15000 })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transaction', id] }),
    onError: () => setErrorModalOpen(true)
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError || !transaction) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">Venda não encontrada ou erro ao carregar.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/transactions')}>Voltar para Movimentações</Button>
      </Box>
    )
  }

  const dateObj = new Date(transaction.updated_at)
  const isNfceLocked = ['approved', 'processing'].includes(transaction.nfe_status)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} color="inherit">
          Voltar
        </Button>
      </Box>

      <PageHeader 
        title={`Venda #${transaction.id}`}
        subtitle={`${dateObj.toLocaleDateString('pt-BR')} às ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
        icon={ReceiptIcon} 
        color="primary" 
      />

      {transaction.nfe_status === 'error' && transaction.nfe_message && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          Erro ao emitir nota: {transaction.nfe_message}
        </Alert>
      )}

      {transaction.nfe_status === 'processing' && (
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          NFC-e enviada e em processamento. Aguarde.
        </Alert>
      )}

      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" fontWeight="bold">Itens da Venda</Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Total: R$ {Number(transaction.total_value).toFixed(2)}
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>Descrição do Item</TableCell>
                  <TableCell align="right">Qtd</TableCell>
                  <TableCell align="right">Valor Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaction.items?.map((item: any) => (
                  <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">R$ {Number(item.sell_price).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      R$ {(Number(item.sell_price) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Forma de Pagamento</InputLabel>
          <Select 
            value={effectivePaymentMethod} 
            onChange={(e) => setLocalPaymentMethod(e.target.value)}
            label="Forma de Pagamento"
            disabled={isNfceLocked}
          >
            <MenuItem value="dinheiro">Dinheiro</MenuItem>
            <MenuItem value="pix">PIX</MenuItem>
            <MenuItem value="cartao_credito">Cartão de Crédito</MenuItem>
            <MenuItem value="cartao_debito">Cartão de Débito</MenuItem>
          </Select>
        </FormControl>

        {transaction.nfe_url ? (
          <Button variant="contained" color="success" href={transaction.nfe_url} target="_blank">
            Visualizar NFC-e
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={() => issueNfce()} disabled={isNfceLocked || isIssuing}>
            {isIssuing ? 'Emitindo...' : 'Emitir NFC-e'}
          </Button>
        )}
      </Box>

      <Dialog open={errorModalOpen} onClose={() => setErrorModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          Erro na Emissão
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1, wordBreak: 'break-word' }}>
            {(issueError as any)?.response?.data?.detail || issueError?.message || "Erro desconhecido ao tentar emitir a nota."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorModalOpen(false)} color="primary" variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}