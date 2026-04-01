import { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

import api from '@/services/api'
import { PageWrapper, Content } from './Purchases.styles'
import { PageHeader } from '@/components/PageHeader'

const EditPrices = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data } = await api.get(`api/catalog/items/${id}/`)
      return data
    },
  })

  const mutation = useMutation({
    mutationFn: async (payload: { cost_price: string; sell_price: string }) => {
      const { data } = await api.patch(`api/inventory/prices/${id}/`, payload)
      return data
    },
    onSuccess: (updatedPrices) => {
      queryClient.setQueriesData({ queryKey: ['purchases'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            results: page.results.map((i: any) =>
              String(i.id) === id
                ? { ...i, inventory: { ...i.inventory, ...updatedPrices } }
                : i
            ),
          })),
        }
      })

      queryClient.setQueryData(['item', id], (oldItem: any) => {
        if (!oldItem) return oldItem
        return { ...oldItem, inventory: { ...oldItem.inventory, ...updatedPrices } }
      })

      navigate('/purchases')
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    mutation.mutate({ 
      cost_price: formData.get('cost_price') as string, 
      sell_price: formData.get('sell_price') as string 
    })
  }

  return (
    <PageWrapper>
      <Content>
        <PageHeader 
          title="Editar Preços" 
          subtitle="Ajuste de Custo e Venda" 
          icon={AttachMoneyIcon}
          color="warning"
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">Erro ao carregar item.</Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <TextField
              label="Descrição do Item"
              defaultValue={item?.description || ''}
              disabled
              fullWidth
              variant="filled"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="cost_price"
                label="Custo (R$)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                defaultValue={item?.inventory?.cost_price || '0.00'}
                required
                fullWidth
              />
              
              <TextField
                name="sell_price"
                label="Preço de Venda (R$)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                defaultValue={item?.inventory?.sell_price || '0.00'}
                required
                fullWidth
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={() => navigate('/purchases')} variant="outlined" color="inherit">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="warning" 
                disabled={mutation.isPending}
                sx={{ color: '#fff' }}
              >
                {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Box>
          </Box>
        )}
      </Content>
    </PageWrapper>
  )
}

export default EditPrices