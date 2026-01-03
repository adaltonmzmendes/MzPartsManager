import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'
import { Dialog, Slide } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import { forwardRef } from 'react'

import api from '@/services/api'
import ItemDetailsHeader from './ItemDetailsHeader'
import ItemDetailsForm from './ItemDetailsForm'


interface Item {
  id: number
  description: string
  conversions?: string[]
  tags?: string[]
  applications?: string[]
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
  const [activeTab, setActiveTab] = useState(0)
  const [globalSuggestions, setGlobalSuggestions] = useState<GlobalSuggestions | null>(null)
  
  const [form, setForm] = useState<ItemFormState>({
    description: item.description,
    conversions: item.conversions ?? [],
    tags: item.tags ?? [],
    applications: item.applications ?? [],
  })

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await api.get(`api/catalog/items/${item.id}/suggestions/`)
        if (response.status === 200 && response.data) {
          setGlobalSuggestions(response.data)
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error)
      }
    }
    fetchSuggestions()
  }, [item.id])

  const handleChange =
    <K extends keyof ItemFormState>(field: K) =>
    (value: ItemFormState[K]) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }))
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

      onSaved()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar item:', error)
    }
  }

  return (
    <>
      <ItemDetailsHeader 
        onClose={onClose} 
        onSave={handleSave} 
        showSave={true}
      />
      <ItemDetailsForm 
        form={form} 
        globalSuggestions={globalSuggestions}
        onChange={handleChange}
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