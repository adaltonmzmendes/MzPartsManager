import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography, Paper, Autocomplete, Stack } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'

interface AddItemPayload {
  description: string
  conversions_input: string[]
  tags_input: string[]
  applications_input: string[]
}

const AddItem = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [description, setDescription] = useState('')
  const [conversions, setConversions] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [applications, setApplications] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const mutation = useMutation({
    mutationFn: async (payload: AddItemPayload) => {
      const { data } = await api.post('/api/catalog/items/', payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      navigate(`/purchases/${data.id}/prices`)
    },
    onError: (error: any) => {
      const msg = error.response?.data?.description?.[0] || 'Ocorreu um erro ao salvar o item.'
      setErrorMsg(msg)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    mutation.mutate({
      description,
      conversions_input: conversions,
      tags_input: tags,
      applications_input: applications,
    })
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom fontWeight={600}>
          Adicionar Novo Item
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ mt: 3 }}>
            <TextField
              label="Descrição do Item"
              required
              fullWidth
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setErrorMsg('')
              }}
              disabled={mutation.isPending}
              error={!!errorMsg}
              helperText={errorMsg}
            />

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={conversions}
              onChange={(_, newValue) => setConversions(newValue as string[])}
              disabled={mutation.isPending}
              renderInput={(params) => (
                <TextField {...params} label="Conversões (Pressione Enter para adicionar)" />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={tags}
              onChange={(_, newValue) => setTags(newValue as string[])}
              disabled={mutation.isPending}
              renderInput={(params) => (
                <TextField {...params} label="Tags (Pressione Enter para adicionar)" />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={applications}
              onChange={(_, newValue) => setApplications(newValue as string[])}
              disabled={mutation.isPending}
              renderInput={(params) => (
                <TextField {...params} label="Aplicações (Pressione Enter para adicionar)" />
              )}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)} 
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={!description.trim() || mutation.isPending}
              >
                {mutation.isPending ? 'Salvando...' : 'Salvar Item'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  )
}

export default AddItem