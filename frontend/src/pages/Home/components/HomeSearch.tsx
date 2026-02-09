import { useState } from 'react'
import { Box, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

// Importando o estilo do componente pai (ajuste o caminho se necessário)
import { SearchField } from '../Home.styles'

interface HomeSearchProps {
  onSearch: (term: string) => void
}

export const HomeSearch = ({ onSearch }: HomeSearchProps) => {
  const [localInput, setLocalInput] = useState('')

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(localInput)
    }
  }

  return (
    <Box sx={{ mt: 1, mb: 4 }}>
      <SearchField
        value={localInput}
        onChange={(e) => setLocalInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Pesquisar..."
        autoFocus
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}