import * as React from 'react'
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
import CloseSmallIcon from '@mui/icons-material/Close'

const Applications = ({ applications, onChange }) => {
  const [applicationInput, setApplicationInput] = React.useState('')
  const [editingIndex, setEditingIndex] = React.useState(null)
  const [editingValue, setEditingValue] = React.useState('')

  const handleAddApplication = () => {
    if (!applicationInput.trim()) return
    onChange([...applications, applicationInput.trim()])
    setApplicationInput('')
  }

  const handleRemoveApplication = (index) => {
    onChange(applications.filter((_, i) => i !== index))
  }

  const startEditing = (index) => {
    setEditingIndex(index)
    setEditingValue(applications[index])
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditingValue('')
  }

  const saveEditing = () => {
    if (!editingValue.trim()) return

    const updated = applications.map((app, i) =>
      i === editingIndex ? editingValue.trim() : app
    )

    onChange(updated)
    cancelEditing()
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
        value={applicationInput}
        onChange={(e) => setApplicationInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault()
            handleAddApplication()
          }
        }}
        helperText="Digite a aplicação e pressione Ctrl + Enter para adicionar"
      />

      <Button
        variant="outlined"
        onClick={handleAddApplication}
        disabled={!applicationInput.trim()}
      >
        Adicionar aplicação
      </Button>

      {applications.map((app, index) => (
        <Paper
          key={index}
          variant="outlined"
          sx={{
            p: 2,
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
          }}
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
                <IconButton size="small" onClick={saveEditing}>
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={cancelEditing}>
                  <CloseSmallIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  size="small"
                  onClick={() => startEditing(index)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveApplication(index)}
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
