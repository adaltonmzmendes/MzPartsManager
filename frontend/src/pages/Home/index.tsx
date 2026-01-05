import { useState } from 'react'
import { Box } from '@mui/material'

import SearchBar from '@/components/SearchBar'
import ItemDetailsModal from '../ItemDetails/ItemDetailsModal'
import { PageWrapper, Content } from './Home.styles'

import { useDebounce } from '@/hooks/useDebounce'
import { useModalState } from '@/hooks/useModalState'
import { useCatalogItems } from '@/hooks/useCatalogItems'
import { ItemData } from '@/components/ItemRow'

import CatalogList from '@/components/Catalog'
import { LoadingState, ErrorState } from '@/components/States'

const Home = () => {
  // 1. Estado Local (Busca)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  // 2. Hooks Customizados
  const { 
    allItems, 
    totalCount, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    invalidateCatalog 
  } = useCatalogItems(debouncedSearch)

  const { 
    isOpen: modalOpen, 
    data: selectedItem, 
    open: handleOpenItem, 
    close: handleCloseModal 
  } = useModalState<ItemData>()

  return (
    <PageWrapper>
      <Content>
        <Box sx={{ mt: 1, mb: 4 }}>
          <SearchBar
            onSearch={setSearchTerm}
            placeholder="Pesquisar…"
          />
        </Box>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState />
        ) : (
          <>
            <Box sx={{ mb: 2, fontWeight: 600 }}>
              Itens encontrados: {totalCount}
            </Box>

            <CatalogList
              items={allItems}
              onInfoClick={handleOpenItem}
              onIntersect={fetchNextPage}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </>
        )}

        <ItemDetailsModal
          open={modalOpen}
          item={selectedItem}
          onClose={handleCloseModal}
          onSaved={invalidateCatalog}
        />
      </Content>
    </PageWrapper>
  )
}

export default Home