import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Paper, Stack } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import ImagesCarousel from '@/components/ImagesCarousel'

import Description from '../ItemDetails/fields/Description'
import Conversions from '../ItemDetails/fields/Conversions'
import Tags from '../ItemDetails/fields/Tags'
import Applications from '../ItemDetails/fields/Applications'

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
  const [newImages, setNewImages] = useState<File[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const mutation = useMutation({
    mutationFn: async (payload: AddItemPayload) => {
      const { data } = await api.post('/api/catalog/items/', payload)

      if (newImages.length > 0) {
        const formData = new FormData()
        newImages.forEach(file => formData.append('images', file))
        
        await api.post(`/api/catalog/items/${data.id}/upload_images/`, formData)
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
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
            
            <Description 
              value={description}
              onChange={(val) => {
                setDescription(val)
                setErrorMsg('')
              }}
              disabled={mutation.isPending}
              error={!!errorMsg}
              helperText={errorMsg}
            />

            <Conversions 
              value={conversions}
              onChange={setConversions}
              disabled={mutation.isPending}
            />

            <Tags 
              value={tags}
              onChange={setTags}
              disabled={mutation.isPending}
            />

            <Applications 
              applications={applications}
              onChange={setApplications}
              disabled={mutation.isPending}
            />

            <ImagesCarousel 
              existingImages={[]} 
              newImages={newImages} 
              onAddImages={(files) => setNewImages(prev => [...prev, ...files])} 
              onRemoveNewImage={(index) => setNewImages(prev => prev.filter((_, i) => i !== index))}
              onRemoveExistingImage={() => {}}
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