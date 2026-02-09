import { useState, useEffect } from 'react'
import {
  Box,
  InputAdornment,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

import api from '@/services/api'
import { PageWrapper, Content, SearchField, ItemCard } from './Home.styles'
import ItemDetailsModal from '../ItemDetails/ItemDetailsModal'

// --- TIPO ---
export interface Item {
  id: number
  description: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  results: T[]
}

interface HomeSearchProps {
  onSearch: (term: string) => void
}

const HomeSearch = ({ onSearch }: HomeSearchProps) => {
  const [localInput, setLocalInput] = useState('')

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(localInput)
    }
  }

  return (
    <Box sx={{ mt: 1, mb: 4 }}>
      <SearchField
        value={localInput}
        onChange={(e) => setLocalInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Pesquisar..."
        autoFocus
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}

interface HomeItemRowProps {
  item: Item
  onOpenDetails: (item: Item) => void
}

const HomeItemRow = ({ item, onOpenDetails }: HomeItemRowProps) => {
  return (
    <ItemCard
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>{item.description}</Box>
      <IconButton
        size="small"
        onClick={() => onOpenDetails(item)}
        aria-label="Informações do item"
      >
        <InfoOutlinedIcon />
      </IconButton>
    </ItemCard>
  )
}

interface ScrollSentinelProps {
  isFetchingNextPage: boolean
  onVisibilityChange: (inView: boolean) => void
}

const ScrollSentinel = ({ isFetchingNextPage, onVisibilityChange }: ScrollSentinelProps) => {
  const { ref, inView } = useInView()

  useEffect(() => {
    onVisibilityChange(inView)
  }, [inView, onVisibilityChange])

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        py: 2,
        minHeight: 50,
      }}
    >
      {isFetchingNextPage && <CircularProgress size={24} />}
    </Box>
  )
}

const Home = () => {
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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
      const res = await api.get('api/catalog/items/', { params })
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

  const handleVisibilityChange = (inView: boolean) => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }

  const handleOpenItem = (item: Item) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedItem(null)
  }

  const allItems = data?.pages.flatMap((page) => page.results) || []
  const totalCount = data?.pages[0]?.count || 0

  return (
    <PageWrapper>
      <Content>
        <HomeSearch onSearch={setActiveSearch} />

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
            <Box sx={{ mb: 2, fontWeight: 600 }}>
              Itens encontrados: {totalCount}
            </Box>

            {allItems.map((item) => (
              <HomeItemRow 
                key={item.id} 
                item={item} 
                onOpenDetails={handleOpenItem} 
              />
            ))}

            <ScrollSentinel 
              isFetchingNextPage={isFetchingNextPage}
              onVisibilityChange={handleVisibilityChange}
            />
          </>
        )}

        <ItemDetailsModal
          open={modalOpen}
          item={selectedItem}
          onClose={handleCloseModal}
          onSaved={() => refetch()}
        />
      </Content>
    </PageWrapper>
  )
}

export default Home