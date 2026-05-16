import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, CircularProgress, Typography, IconButton, Tooltip, Snackbar, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import api from '@/services/api'
import { PageWrapper, Content } from './Purchases.styles'
import { Item, PaginatedResponse } from './types'
import { Search } from '@/components/Search'
import { ItemRow } from '@/components/ItemRow'
import { ScrollSentinel } from '../../components/ScrollSentinel'
import { PageHeader } from '@/components/PageHeader'

const Purchases = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [activeSearch, setActiveSearch] = useState('')
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<PaginatedResponse<Item>>({
    queryKey: ['purchases', activeSearch],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = { page: pageParam, ...(activeSearch && { search: activeSearch }) }
      const res = await api.get<PaginatedResponse<Item>>('api/catalog/items/', { params })
      return res.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      const url = new URL(lastPage.next)
      const nextPage = url.searchParams.get('page')
      return nextPage ? Number(nextPage) : undefined
    },
  })

  const { mutate: addToPurchaseCart } = useMutation({
    mutationFn: async (itemId: number | string) => {
      await api.post('api/purchases/add_item/', { item_id: itemId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseCart'] })
      setSnackbar({ open: true, message: 'Item adicionado à compra.', severity: 'success' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`api/catalog/items/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const handleArchive = async (item: Item) => {
    if (confirm('Deseja arquivar este item?')) {
      await deleteMutation.mutateAsync(item.id)
    }
  }

  const allItems = data?.pages.flatMap((page) => page.results) || []
  const totalCount = data?.pages[0]?.count || 0

  return (
    <PageWrapper>
      <Content>
        <PageHeader 
          title="Compras" 
          subtitle="Gestão de Aquisições" 
          icon={ShoppingCartIcon}
          color="warning" 
        />

        <Search 
          onSearch={setActiveSearch} 
          action={
            <Button 
              variant="contained" 
              color="warning"
              startIcon={<AddIcon />}
              onClick={() => navigate('/purchases/add')}
              sx={{ color: '#fff' }}
            >
              Novo Item
            </Button>
          }
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="warning" /></Box>
        ) : isError ? (
          <Typography color="error" align="center">Erro ao carregar compras.</Typography>
        ) : (
          <>
            <Box sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>Itens encontrados: {totalCount}</Box>

            {allItems.map((item) => (
              <ItemRow 
                key={item.id} 
                item={item} 
                showPrice={true}
                showCost={true}
                actions={
                  <>
                    <Tooltip title="Adicionar à Compra">
                      <IconButton size="small" color="warning" onClick={() => addToPurchaseCart(item.id)}>
                        <AddShoppingCartIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar Preços">
                      <IconButton size="small" color="primary" onClick={() => navigate(`/purchases/${item.id}/prices`)}>
                        <AttachMoneyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Arquivar">
                      <IconButton size="small" color="default" onClick={() => handleArchive(item)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              />
            ))}

            <ScrollSentinel 
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onFetchNext={fetchNextPage}
            />
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Content>
    </PageWrapper>
  )
}

export default Purchases