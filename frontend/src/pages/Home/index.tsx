import { useState } from 'react'
import { Box, CircularProgress, Typography, IconButton, Snackbar, Alert } from '@mui/material'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import HomeIcon from '@mui/icons-material/Home'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'

import api from '@/services/api'
import { PageWrapper, Content } from './Home.styles'
import ItemDetailsModal from '../ItemDetails/ItemDetailsModal'

import { Item, PaginatedResponse } from './types'
import { Search } from '../../components/Search'
import { ItemRow } from '@/components/ItemRow'
import { ScrollSentinel } from '../../components/ScrollSentinel'
import { PageHeader } from '@/components/PageHeader'

const Home = () => {
  const queryClient = useQueryClient()
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const {
    data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch,
  } = useInfiniteQuery<PaginatedResponse<Item>>({
    queryKey: ['items', activeSearch],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await api.get<PaginatedResponse<Item>>('api/catalog/items/', {
        params: { page: pageParam, ...(activeSearch && { search: activeSearch }) }
      })
      return res.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      return Number(new URL(lastPage.next).searchParams.get('page')) || undefined
    },
  })

  const { mutate: addToCart } = useMutation({
    mutationFn: async (itemId: number | string) => {
      await api.post('api/cart/add_item/', { item_id: itemId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setSnackbar({ open: true, message: 'Item adicionado ao carrinho com sucesso', severity: 'success' })
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Erro ao adicionar item ao carrinho', severity: 'error' })
    },
  })

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const allItems = data?.pages.flatMap((page) => page.results) || []
  const totalCount = data?.pages[0]?.count || 0

  return (
    <PageWrapper>
      <Content>
        <PageHeader 
          title="Catálogo" 
          subtitle="Visão Geral do Estoque" 
          icon={HomeIcon}
          color="primary"
        />

        <Search onSearch={setActiveSearch} />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : isError ? (
          <Typography color="error" align="center">Erro ao carregar itens.</Typography>
        ) : (
          <>
            <Box sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
              itens encontrados: {totalCount}
            </Box>

            {allItems.map((item) => (
              <ItemRow 
                key={item.id} 
                item={item} 
                showPrice={true}
                onOpenDetails={setSelectedItem}
                actions={
                  <IconButton 
                    color="primary" 
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(item.id)
                    }}
                  >
                    <AddShoppingCartIcon />
                  </IconButton>
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

        <ItemDetailsModal
          open={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSaved={() => refetch()}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
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

export default Home