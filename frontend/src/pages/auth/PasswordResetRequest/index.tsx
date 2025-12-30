import { useState } from 'react'
import { Box } from '@mui/material'
import { useForm } from 'react-hook-form'

import FormTextField from '@/components/forms/FormTextField'
import FormButton from '@/components/forms/FormButton'
import MyMessage from '@/components/Message'
import api from '@/services/api'

/* ===========================
   TYPES
=========================== */
interface PasswordResetRequestFormData {
  email: string
}

/* ===========================
   COMPONENT
=========================== */
const PasswordResetRequest = () => {
  const { handleSubmit, control } =
    useForm<PasswordResetRequestFormData>()

  const [showMessage, setShowMessage] = useState(false)

  const submission = async (
    data: PasswordResetRequestFormData
  ) => {
    try {
      await api.post('api/password_reset/', {
        email: data.email,
      })

      setShowMessage(true)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="myBackground">
      {showMessage && (
        <MyMessage
          text="Se o seu email existe, você recebeu um email com as instruções para recuperar sua senha"
          color="#69C9AB"
        />
      )}

      <form onSubmit={handleSubmit(submission)}>
        <Box className="whiteBox">
          <Box className="itemBox">
            <Box className="title">
              Redefinir Senha
            </Box>
          </Box>

          <Box className="itemBox">
            <FormTextField
              label="Email"
              name="email"
              control={control}
            />
          </Box>

          <Box className="itemBox">
            <FormButton
              label="Solicitar redefinição de senha"
              type="submit"
              fullWidth
            />
          </Box>
        </Box>
      </form>
    </div>
  )
}

export default PasswordResetRequest
