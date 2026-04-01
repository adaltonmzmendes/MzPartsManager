import { Box, Tabs, Tab, Typography, Chip, Stack, Alert, Paper, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

import Description from './fields/Description'
import Conversions from './fields/Conversions'
import Tags from './fields/Tags'
import Applications from './fields/Applications'

import { formContainerSx } from './ItemDetailsForm.styles'

interface GlobalSuggestions {
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

interface ItemDetailsFormProps {
  form: ItemFormState
  globalSuggestions: GlobalSuggestions | null
  activeTab: number
  onTabChange: (newValue: number) => void
  onChange: <K extends keyof ItemFormState>(
    field: K
  ) => (value: ItemFormState[K]) => void
  onAcceptSuggestion: (
    field: keyof Omit<ItemFormState, 'description'>,
    value: string
  ) => void
}

const ItemDetailsForm = ({
  form,
  globalSuggestions,
  activeTab,
  onTabChange,
  onChange,
  onAcceptSuggestion,
}: ItemDetailsFormProps) => {

  const renderLocalTab = () => (
    <>
      <Description
        value={form.description}
        onChange={onChange('description')}
      />
      <Conversions
        value={form.conversions}
        onChange={onChange('conversions')}
      />
      <Tags
        value={form.tags}
        onChange={onChange('tags')}
      />
      <Applications
        applications={form.applications}
        onChange={onChange('applications')}
      />
    </>
  )

  const renderSuggestionsTab = () => {
    if (!globalSuggestions) {
      return (
        <Alert severity="info">
          Não há sugestões da comunidade disponíveis para este item no momento.
        </Alert>
      )
    }

    const missingConversions = globalSuggestions.conversions.filter(
      (c) => !form.conversions.includes(c)
    )
    const missingTags = globalSuggestions.tags.filter(
      (t) => !form.tags.includes(t)
    )
    const missingApps = globalSuggestions.applications.filter(
      (a) => !form.applications.includes(a)
    )

    const hasSuggestions = 
      missingConversions.length > 0 || 
      missingTags.length > 0 || 
      missingApps.length > 0 ||
      (globalSuggestions.normalized_description && globalSuggestions.normalized_description !== form.description)

    return (
      <Stack spacing={3} sx={{ pb: 2 }}>
        {!hasSuggestions && (
          <Alert severity="success">
             Seu item já está atualizado com todas as definições da comunidade!
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
             Descrição Padronizada (Referência)
          </Typography>
          <Typography color="text.primary" fontWeight="medium">
             {globalSuggestions.normalized_description || "Sem descrição padronizada disponível."}
          </Typography>
        </Paper>

        <SuggestionsSection 
          title="Conversões Sugeridas" 
          items={missingConversions} 
          onAdd={(val) => onAcceptSuggestion('conversions', val)} 
        />

        <SuggestionsSection 
          title="Tags Sugeridas" 
          items={missingTags} 
          onAdd={(val) => onAcceptSuggestion('tags', val)} 
        />

        <SuggestionsSection 
          title="Aplicações Sugeridas" 
          items={missingApps} 
          onAdd={(val) => onAcceptSuggestion('applications', val)} 
          variant="list"
        />
      </Stack>
    )
  }

  return (
    <Box sx={formContainerSx}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
        >
          <Tab label="Sua empresa" />
          <Tab label="Sugestões da comunidade" />
        </Tabs>
      </Box>

      {activeTab === 0 ? renderLocalTab() : renderSuggestionsTab()}
    </Box>
  )
}

const SuggestionsSection = ({ 
    title, 
    items, 
    onAdd,
    variant = 'chips'
}: { 
    title: string, 
    items: string[], 
    onAdd: (val: string) => void,
    variant?: 'chips' | 'list'
}) => {
    if (items.length === 0) return null

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="600" color="text.primary" gutterBottom>
                {title}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {variant === 'chips' ? (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {items.map((item) => (
                        <Chip
                            key={item}
                            label={item}
                            onClick={() => onAdd(item)}
                            icon={<AddCircleOutlineIcon />}
                            color="primary"
                            variant="outlined"
                            clickable
                            sx={{ bgcolor: 'primary.50' }}
                        />
                    ))}
                </Stack>
            ) : (
                <List disablePadding>
                    {items.map((item, index) => (
                        <ListItem
                            key={item}
                            disablePadding
                            secondaryAction={
                                <IconButton edge="end" color="primary" onClick={() => onAdd(item)}>
                                    <AddCircleOutlineIcon />
                                </IconButton>
                            }
                            sx={{
                                borderBottom: index < items.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider',
                                py: 1
                            }}
                        >
                            <ListItemText 
                                primary={item} 
                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    )
}

export default ItemDetailsForm