import { useState } from 'react'
import { Box } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import FormPassField from '@/components/forms/FormPassField'
import FormButton from '@/components/forms/FormButton'
import MyMessage from '@/components/Message'
import api from '@/services/api'

interface PasswordResetFormData {
  password: string
  password2: string
}

const PasswordReset = () => {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()

  const { handleSubmit, control } = useForm<PasswordResetFormData>()
  const [showMessage, setShowMessage] = useState(false)

  const submission = async (data: PasswordResetFormData) => {
    if (!token) return

    try {
      await api.post('api/password_reset/confirm/', {
        password: data.password,
        token,
      })

      setShowMessage(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="myBackground">
      {showMessage && (
        <MyMessage
          text="Sua senha foi redefinida com sucesso!"
          color="#69C9AB"
        />
      )}

      <form onSubmit={handleSubmit(submission)}>
        <Box className="whiteBox">
          <Box className="itemBox">
            <Box className="title">Redefinindo senha</Box>
          </Box>

          <Box className="itemBox">
            <FormPassField
              label="Senha"
              name="password"
              control={control}
            />
          </Box>

          <Box className="itemBox">
            <FormPassField
              label="Confirmar senha"
              name="password2"
              control={control}
            />
          </Box>

          <Box className="itemBox">
            <FormButton
              label="Redefinir senha"
              type="submit"
              fullWidth
            />
          </Box>
        </Box>
      </form>
    </div>
  )
}

export default PasswordReset
