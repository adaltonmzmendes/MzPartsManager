import { Box } from '@mui/material'

import Description from './fields/Description'
import Conversions from './fields/Conversions'
import Tags from './fields/Tags'
import Applications from './fields/Applications'

import { formContainerSx } from './itemInfoForm.styles'

const ItemInfoForm = ({ form, onChange }) => (
  <Box sx={formContainerSx}>
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
  </Box>
)

export default ItemInfoForm
