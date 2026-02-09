import { useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useInfiniteQuery } from '@tanstack/react-query'

import api from '@/services/api'
import { PageWrapper, Content } from './Home.styles'
import ItemDetailsModal from '../ItemDetails/ItemDetailsModal'

// Tipos
import { Item, PaginatedResponse } from './types'

// Componentes
import { HomeSearch } from './components/HomeSearch'
import { HomeItemRow } from './components/HomeItemRow'
import { ScrollSentinel } from './components/ScrollSentinel'

const Home = () => {
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 🔹 React Query
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<PaginatedResponse<Item>>({
    queryKey: ['items', activeSearch],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params: any = { page: pageParam }
      if (activeSearch) params.search = activeSearch
      
      const res = await api.get<PaginatedResponse<Item>>('api/catalog/items/', {
        params,
      })
      return res.data
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next)
        const nextPage = url.searchParams.get('page')
        return nextPage ? Number(nextPage) : undefined
      }
      return undefined
    },
  })

  // 🔹 Handlers
  const handleOpenItem = (item: Item) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedItem(null)
  }

  const handleSavedItem = () => {
    refetch()
  }

  // 🔹 Dados achatados
  const allItems = data?.pages.flatMap((page) => page.results) || []
  const totalCount = data?.pages[0]?.count || 0

  return (
    <PageWrapper>
      <Content>
        {/* 1. Busca */}
        <HomeSearch onSearch={setActiveSearch} />

        {/* 2. Loading Inicial ou Erro */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">
            Erro ao carregar itens.
          </Typography>
        ) : (
          <>
            {/* 3. Contador */}
            <Box sx={{ mb: 2, fontWeight: 600 }}>
              Itens encontrados: {totalCount}
            </Box>

            {/* 4. Lista */}
            {allItems.map((item) => (
              <HomeItemRow 
                key={item.id} 
                item={item} 
                onOpenDetails={handleOpenItem} 
              />
            ))}

            {/* 5. Scroll Infinito */}
            <ScrollSentinel 
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onFetchNext={fetchNextPage}
            />
          </>
        )}

        {/* 6. Modal */}
        <ItemDetailsModal
          open={modalOpen}
          item={selectedItem}
          onClose={handleCloseModal}
          onSaved={handleSavedItem}
        />
      </Content>
    </PageWrapper>
  )
}

export default Home