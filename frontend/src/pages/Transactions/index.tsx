import { Box, Card, CardContent, Typography, CircularProgress, Button } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import ReceiptIcon from '@mui/icons-material/Receipt'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { PageHeader } from '@/components/PageHeader'

export default function Transactions() {
  const navigate = useNavigate()
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('api/cart/history/')
      return res.data
    }
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <PageHeader 
        title="Movimentações" 
        subtitle="Histórico de vendas finalizadas" 
        icon={ReceiptIcon} 
        color="primary" 
      />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
        {(!transactions || transactions.length === 0) && (
          <Typography color="text.secondary">Nenhuma movimentação encontrada.</Typography>
        )}
        
        {transactions?.map((t: any) => {
          const dateObj = new Date(t.updated_at)
          return (
            <Card key={t.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
              <CardContent 
                sx={{ 
                  p: '0 !important', 
                  display: 'flex', 
                  flex: 1, 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Venda #{t.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dateObj.toLocaleDateString('pt-BR')} às {dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    R$ {Number(t.total_value).toFixed(2)}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate(`/transactions/${t.id}`)}
                  >
                    Detalhes da venda
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}