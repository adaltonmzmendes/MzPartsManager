import { useState, useEffect, forwardRef } from 'react'
import {
  Dialog,
  Slide,
} from '@mui/material'

import api from '@/services/api'

import ItemInfoHeader from './ItemInfoHeader'
import ItemInfoForm from './ItemInfoForm'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const ItemInfoModal = ({ open, item, onClose, onSaved }) => {
  const [form, setForm] = useState({
    description: '',
    conversions: [],
    tags: [],
    applications: [],
  })

  useEffect(() => {
    if (item) {
      setForm({
        description: item.description || '',
        conversions: item.conversions || [],
        tags: item.tags || [],
        applications: item.applications || [],
      })
    }
  }, [item])

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await api.patch(`api/catalog/items/${item.id}/`, {
        description: form.description,
        conversions_input: form.conversions,
        tags_input: form.tags,
        applications_input: form.applications,
      })

      onSaved()   // 🔁 Atualiza lista no Home
      onClose()
    } catch (error) {
      console.error('Erro ao salvar item:', error)
    }
  }

  if (!item) return null

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <ItemInfoHeader onClose={onClose} onSave={handleSave} />

      <ItemInfoForm
        form={form}
        onChange={handleChange}
      />
    </Dialog>
  )
}

export default ItemInfoModal
