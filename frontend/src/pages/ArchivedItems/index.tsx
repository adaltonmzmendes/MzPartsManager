import { useEffect, useState } from 'react'
import { Container, Typography, CircularProgress, Box } from '@mui/material'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'

import api from '@/services/api'
import { Item } from '@/pages/Purchases/types'
import { PageHeader } from '@/components/PageHeader'
import { ArchivedItemRow } from '@/components/ArchivedItemRow'
import { EmptyStateContainer } from './ArchivedItems.styles'

export default function ArchivedItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const fetchArchivedItems = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/catalog/items/', {
        params: { archived: 'true' }
      })
      setItems(response.data.results || response.data)
    } catch (error) {
      console.error('Erro ao buscar itens arquivados', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: number) => {
    try {
      await api.post(`/api/catalog/items/${id}/restore/`)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Erro ao restaurar item', error)
    }
  }

  useEffect(() => {
    fetchArchivedItems()
  }, [])

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader 
        title="Arquivo Morto" 
        subtitle="Inventário Inativo" 
        icon={Inventory2OutlinedIcon}
        color="error"
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress color="error" />
        </Box>
      ) : items.length === 0 ? (
        <EmptyStateContainer>
          <Inventory2OutlinedIcon sx={{ fontSize: 60 }} />
          <Typography>O arquivo está vazio.</Typography>
        </EmptyStateContainer>
      ) : (
        // Removido o gap: 2 para que os itens fiquem colados como uma tabela
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item) => (
            <ArchivedItemRow 
              key={item.id} 
              item={item} 
              onRestore={handleRestore} 
            />
          ))}
        </Box>
      )}
    </Container>
  )
}