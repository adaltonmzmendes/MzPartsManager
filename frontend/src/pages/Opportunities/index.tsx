import { useState } from 'react'
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Card, 
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from '@mui/material'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import api from '@/services/api'
import { PageWrapper, Content } from '@/pages/Home/Home.styles'
import { Search } from '@/components/Search'
import { ScrollSentinel } from '@/components/ScrollSentinel'
import { PageHeader } from '@/components/PageHeader'
import { PaginatedLostSales } from './types'

const Opportunities = () => {
  const queryClient = useQueryClient()
  const [activeSearch, setActiveSearch] = useState('')
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedLostSales | any>({
    queryKey: ['lost-sales', activeSearch],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = { 
        page: pageParam, 
        ...(activeSearch && { search: activeSearch }) 
      }
      const res = await api.get('api/opportunities/lost-sales/', { params })
      return res.data
    },
    getNextPageParam: (lastPage: any) => {
      if (!lastPage?.next) return undefined
      const url = new URL(lastPage.next)
      const nextPage = url.searchParams.get('page')
      return nextPage ? Number(nextPage) : undefined
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`api/opportunities/lost-sales/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-sales'] })
      setSnackbar({ open: true, message: 'Registro removido com sucesso!', severity: 'success' })
      setItemToDelete(null)
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Erro ao remover o registro.', severity: 'error' })
      setItemToDelete(null)
    },
  })

  const allSales = data?.pages?.flatMap((page: any) => page?.results ?? (Array.isArray(page) ? page : [])) || []
  const totalCount = data?.pages?.[0]?.count ?? allSales.length

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  return (
    <PageWrapper>
      <Content>
        <PageHeader 
          title="Oportunidades" 
          subtitle="Registro de Vendas Perdidas" 
          icon={LightbulbIcon}
          color="info" 
        />

        <Search onSearch={setActiveSearch} />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress color="info" />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">Erro ao carregar vendas perdidas.</Typography>
        ) : (
          <>
            <Box sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
              Registros encontrados: {totalCount}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {allSales.map((sale: any) => (
                <Card key={sale.id} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: '16px !important', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {sale.item_description || sale.product_name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="error.main" fontWeight={500}>
                          Motivo: {sale.reason_display}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Qtd: {sale.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Data: {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>

                      {sale.observation && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          Obs: {sale.observation}
                        </Typography>
                      )}
                    </Box>

                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={() => setItemToDelete(sale.id)}
                      disabled={deleteMutation.isPending && itemToDelete === sale.id}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <ScrollSentinel 
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onFetchNext={fetchNextPage}
            />
          </>
        )}

        <Dialog open={!!itemToDelete} onClose={() => setItemToDelete(null)}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>Tem certeza que deseja remover este registro de venda perdida? Esta ação não pode ser desfeita.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setItemToDelete(null)} color="inherit">
              Cancelar
            </Button>
            <Button 
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete)} 
              color="error" 
              variant="contained"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Content>
    </PageWrapper>
  )
}

export default Opportunities