import { ReactNode, useState } from 'react'
import { Box, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

import { SearchField } from '../pages/Home/Home.styles'

interface HomeSearchProps {
  onSearch: (term: string) => void
  action?: ReactNode
}

export const Search = ({ onSearch, action }: HomeSearchProps) => {
  const [localInput, setLocalInput] = useState('')

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(localInput)
    }
  }

  return (
    <Box sx={{ mt: 1, mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
      <Box sx={{ flex: 1 }}>
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
      {action}
    </Box>
  )
}