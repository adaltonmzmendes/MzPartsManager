import { styled, alpha } from '@mui/material/styles'
import { Box } from '@mui/material'

export const StyledRow = styled(Box)(({ theme }) => ({
  // Removemos bordas, padding e background externos para não criar o "container" extra
  width: '100%',
  display: 'block',

  // Alvo: O ItemCard (que é o primeiro filho direto vindo do ItemRow)
  '& > div': {
    position: 'relative',
    
    // Mantém o fundo branco original do card
    backgroundColor: theme.palette.background.paper,
    
    // Aplica as listras POR CIMA da cor branca (fundo transparente na imagem permite ver o branco)
    backgroundImage: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      ${alpha(theme.palette.text.disabled, 0.05)} 10px,
      ${alpha(theme.palette.text.disabled, 0.05)} 20px
    )`,
    
    // Aplica o aspecto visual de arquivado
    filter: 'grayscale(100%)',
    opacity: 0.85, 
    transition: 'all 0.3s ease',
    
    // Opcional: Remove interatividade do card geral, mas mantém botões (veja abaixo)
    pointerEvents: 'none',
  },

  // Efeito Hover: restaura a cor e remove listras ao passar o mouse
  '&:hover > div': {
    backgroundImage: 'none',
    filter: 'grayscale(0%)',
    opacity: 1,
  },

  // Reabilita cliques especificamente nos botões dentro do card
  '& button': {
    pointerEvents: 'auto',
  }
}))

// ContentWrapper foi removido pois não é mais necessário