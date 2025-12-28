import api from '@/services/api'
import { useEffect, useState } from 'react'
import {
  Box,
  InputAdornment,
  CircularProgress,
  IconButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import {
  PageWrapper,
  Content,
  SearchField,
  ItemCard,
} from './Home.styles'

import ItemInfoModal from '../ItemInfo/ItemInfoModal'

const Home = () => {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedItem, setSelectedItem] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 🔹 Carrega itens (reutilizável)
  const fetchItems = () => {
    setLoading(true)
    api.get('api/catalog/items/')
      .then((res) => {
        setItems(res.data)
        setFilteredItems(res.data)
      })
      .finally(() => setLoading(false))
  }

  // 🔹 Inicial
  useEffect(() => {
    fetchItems()
  }, [])

  // 🔹 Filtro de busca
  useEffect(() => {
    const term = search.toLowerCase()
    setFilteredItems(
      items.filter(item =>
        item.description.toLowerCase().includes(term)
      )
    )
  }, [search, items])

  // 🔹 Abre modal
  const handleOpenItem = (item) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  // 🔹 Fecha modal
  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedItem(null)
  }

  return (
    <PageWrapper>
      <Content>

        {/* 🔍 Barra de pesquisa */}
        <Box sx={{ mt: 1, mb: 4 }}>
          <SearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar itens…"
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

        {/* ⏳ Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* 📊 Contador */}
            <Box sx={{ mb: 2, fontWeight: 600 }}>
              Itens encontrados: {filteredItems.length}
            </Box>

            {/* 📦 Lista de itens */}
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  {item.description}
                </Box>

                <IconButton
                  size="small"
                  onClick={() => handleOpenItem(item)}
                  aria-label="Informações do item"
                >
                  <InfoOutlinedIcon />
                </IconButton>
              </ItemCard>
            ))}
          </>
        )}

        {/* 🧾 Modal */}
        <ItemInfoModal
          open={modalOpen}
          item={selectedItem}
          onClose={handleCloseModal}
          onSaved={fetchItems}
        />

      </Content>
    </PageWrapper>
  )
}

export default Home
