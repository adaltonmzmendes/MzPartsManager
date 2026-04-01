import { ReactNode } from 'react'
import { Box, Typography, Divider } from '@mui/material'
import { SvgIconComponent } from '@mui/icons-material'

interface PageHeaderProps {
  title: string
  subtitle: string
  icon: SvgIconComponent
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  color = 'primary' 
}: PageHeaderProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Icon sx={{ fontSize: 40, color: `${color}.main` }} />
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ fontWeight: 500, color: 'text.primary' }}
          >
            {title}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              textTransform: 'uppercase', 
              letterSpacing: 1, 
              color: `${color}.main`,
              fontWeight: 'bold'
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderBottomWidth: 2, borderColor: `${color}.light`, opacity: 0.5 }} />
    </Box>
  )
}