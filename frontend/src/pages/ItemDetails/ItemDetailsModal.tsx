import { useState, forwardRef } from 'react'
import type { ReactElement } from 'react'
import { Dialog, Slide } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/services/api'
import ItemDetailsHeader from './ItemDetailsHeader'
import ItemDetailsForm from './ItemDetailsForm'

interface ItemImage {
  id: number
  image: string
}

interface Item {
  id: number
  description: string
  conversions?: string[]
  tags?: string[]
  applications?: string[]
  images?: ItemImage[]
}

export interface GlobalSuggestions {
  normalized_description: string | null
  conversions: string[]
  tags: string[]
  applications: string[]
}

interface ItemFormState {
  description: string
  conversions: string[]
  tags: string[]
  applications: string[]
}

interface ItemDetailsModalProps {
  open: boolean
  item: Item | null
  onClose: () => void
  onSaved: () => void
}

interface ItemEditorProps {
  item: Item
  onClose: () => void
  onSaved: () => void
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

const ItemEditor = ({ item, onClose, onSaved }: ItemEditorProps) => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const [newImages, setNewImages] = useState<File[]>([])
  const [deletedImagesIds, setDeletedImagesIds] = useState<number[]>([])
  
  const [form, setForm] = useState<ItemFormState>({
    description: item.description,
    conversions: item.conversions ?? [],
    tags: item.tags ?? [],
    applications: item.applications ?? [],
  })

  const { data: globalSuggestions } = useQuery<GlobalSuggestions>({
    queryKey: ['item-suggestions', item.id],
    queryFn: async () => {
      const response = await api.get(`api/catalog/items/${item.id}/suggestions/`)
      return response.data
    },
    enabled: !!item.id,
    staleTime: 1000 * 60 * 5,
  })

  const handleChange =
    <K extends keyof ItemFormState>(field: K) =>
    (value: ItemFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    }

  const handleAcceptSuggestion = (
    field: keyof Omit<ItemFormState, 'description'>,
    value: string
  ) => {
    const currentList = form[field]
    if (!currentList.includes(value)) {
      handleChange(field)([...currentList, value])
    }
  }

  const handleSave = async () => {
    try {
      await api.patch(`api/catalog/items/${item.id}/`, {
        description: form.description,
        conversions_input: form.conversions,
        tags_input: form.tags,
        applications_input: form.applications,
      })

      if (deletedImagesIds.length > 0) {
        await Promise.all(
          deletedImagesIds.map(imageId => 
            api.delete(`api/catalog/items/${item.id}/images/${imageId}/`)
          )
        )
      }

      if (newImages.length > 0) {
        const formData = new FormData()
        newImages.forEach(file => formData.append('images', file))
        
        await api.post(`api/catalog/items/${item.id}/upload_images/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      queryClient.invalidateQueries({ queryKey: ['items'] })
      onSaved()
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data 
        ? JSON.stringify(error.response.data, null, 2) 
        : error.message
        
      alert(`Erro 400 do Backend:\n\n${errorMessage}`)
      console.error('Detalhes do erro:', error.response?.data)
    }
  }

  const visibleExistingImages = item.images?.filter(img => !deletedImagesIds.includes(img.id)) || []

  return (
    <>
      <ItemDetailsHeader 
        onClose={onClose} 
        onSave={handleSave} 
        showSave={true}
      />
      <ItemDetailsForm 
        form={form} 
        existingImages={visibleExistingImages}
        newImages={newImages}
        globalSuggestions={globalSuggestions}
        onChange={handleChange}
        onAddImages={(files) => setNewImages(prev => [...prev, ...files])}
        onRemoveNewImage={(index) => setNewImages(prev => prev.filter((_, i) => i !== index))}
        onRemoveExistingImage={(id) => setDeletedImagesIds(prev => [...prev, id])}
        onAcceptSuggestion={handleAcceptSuggestion}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </>
  )
}

const ItemDetailsModal = ({
  open,
  item,
  onClose,
  onSaved,
}: ItemDetailsModalProps) => {
  return (
    <Dialog
      fullScreen
      open={open && !!item}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      {item && (
        <ItemEditor
          key={item.id} 
          item={item}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  )
}

export default ItemDetailsModal