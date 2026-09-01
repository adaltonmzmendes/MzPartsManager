import { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ApplicationsProps {
  applications: string[]
  onChange: (value: string[]) => void
}

interface SortableItemProps {
  id: string
  app: string
  index: number
  isEditing: boolean
  editingValue: string
  onEditChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  onStartEdit: (index: number) => void
  onRemove: (index: number) => void
}

const SortableItem = ({
  id,
  app,
  index,
  isEditing,
  editingValue,
  onEditChange,
  onSave,
  onCancel,
  onStartEdit,
  onRemove,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{ p: 2, display: 'flex', gap: 2, alignItems: isEditing ? 'flex-start' : 'center' }}
    >
      {/* O handle de drag é isolado neste Box para não interferir nos inputs e botões */}
      <Box
        {...attributes}
        {...listeners}
        sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', mt: isEditing ? 1 : 0 }}
      >
        <DragIndicatorIcon color="action" />
      </Box>

      <Box sx={{ flex: 1 }}>
        {isEditing ? (
          <TextField
            multiline
            minRows={2}
            value={editingValue}
            onChange={(e) => onEditChange(e.target.value)}
            fullWidth
          />
        ) : (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{app}</Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: isEditing ? 1 : 0 }}>
        {isEditing ? (
          <>
            <IconButton size="small" onClick={onSave}>
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onCancel}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton size="small" onClick={() => onStartEdit(index)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onRemove(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Paper>
  )
}

const Applications = ({ applications, onChange }: ApplicationsProps) => {
  const [input, setInput] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const addApplication = () => {
    const value = input.trim()
    // Evita duplicatas para garantir que as strings funcionem como IDs únicos no dnd-kit
    if (!value || applications.includes(value)) return
    onChange([...applications, value])
    setInput('')
  }

  const removeApplication = (index: number) => {
    onChange(applications.filter((_, i) => i !== index))
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditingValue(applications[index])
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingValue('')
  }

  const saveEdit = () => {
    const value = editingValue.trim()
    if (!value || editingIndex === null || (value !== applications[editingIndex] && applications.includes(value))) return
    
    onChange(applications.map((app, i) => (i === editingIndex ? value : app)))
    cancelEdit()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = applications.indexOf(active.id as string)
      const newIndex = applications.indexOf(over.id as string)
      onChange(arrayMove(applications, oldIndex, newIndex))
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1">Aplicações</Typography>

      <TextField
        label="Adicionar aplicação"
        multiline
        minRows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault()
            addApplication()
          }
        }}
        helperText="Ctrl + Enter para adicionar"
      />

      <Button variant="outlined" onClick={addApplication} disabled={!input.trim()}>
        Adicionar aplicação
      </Button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={applications} strategy={verticalListSortingStrategy}>
          {applications.map((app, index) => (
            <SortableItem
              key={app}
              id={app}
              app={app}
              index={index}
              isEditing={editingIndex === index}
              editingValue={editingValue}
              onEditChange={setEditingValue}
              onSave={saveEdit}
              onCancel={cancelEdit}
              onStartEdit={startEdit}
              onRemove={removeApplication}
            />
          ))}
        </SortableContext>
      </DndContext>
    </Box>
  )
}

export default Applications