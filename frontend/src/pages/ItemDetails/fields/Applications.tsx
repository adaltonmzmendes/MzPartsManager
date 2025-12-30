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

interface ApplicationsProps {
  applications: string[]
  onChange: (value: string[]) => void
}

const Applications = ({
  applications,
  onChange,
}: ApplicationsProps) => {
  const [input, setInput] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const addApplication = () => {
    if (!input.trim()) return
    onChange([...applications, input.trim()])
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
    if (!editingValue.trim() || editingIndex === null) return

    onChange(
      applications.map((app, i) =>
        i === editingIndex ? editingValue.trim() : app
      )
    )

    cancelEdit()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1">
        Aplicações
      </Typography>

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

      <Button
        variant="outlined"
        onClick={addApplication}
        disabled={!input.trim()}
      >
        Adicionar aplicação
      </Button>

      {applications.map((app, index) => (
        <Paper
          key={index}
          variant="outlined"
          sx={{ p: 2, display: 'flex', gap: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            {editingIndex === index ? (
              <TextField
                multiline
                minRows={2}
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                fullWidth
              />
            ) : (
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                {app}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {editingIndex === index ? (
              <>
                <IconButton size="small" onClick={saveEdit}>
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={cancelEdit}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  size="small"
                  onClick={() => startEdit(index)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => removeApplication(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  )
}

export default Applications
