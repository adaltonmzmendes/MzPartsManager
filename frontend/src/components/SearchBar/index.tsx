import { useState, KeyboardEvent } from 'react'
import { InputAdornment } from '@mui/material'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import { styled } from '@mui/material/styles'

// 🎨 Estilo Fixo (Copiado de Home.styles.ts)
const StyledSearchField = styled(TextField)(() => ({
  backgroundColor: '#fff',
  borderRadius: 999,
  boxShadow: '0px 2px 10px rgba(0,0,0,0.15)',
  '& fieldset': {
    border: 'none',
  },
}))

interface SearchBarProps {
  onSearch: (term: string) => void
  placeholder?: string
}

const SearchBar = ({ onSearch, placeholder = 'Pesquisar...' }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      onSearch(inputValue)
    }
  }

  return (
    <StyledSearchField
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
    />
  )
}

export default SearchBar