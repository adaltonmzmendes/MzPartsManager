import { Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import FormTextField from '@/components/forms/FormTextField'
import FormPassField from '@/components/forms/FormPassField'
import FormButton from '@/components/forms/FormButton'
import api from '@/services/api'

/* ===========================
   TYPES
=========================== */
interface RegisterFormData {
  email: string
  password: string
  password2: string
}

/* ===========================
   VALIDATION
=========================== */
const schema: yup.ObjectSchema<RegisterFormData> = yup.object({
  email: yup
    .string()
    .email('Insira um endereço de email válido')
    .required('Campo email é obrigatório'),

  password: yup
    .string()
    .required('Campo senha é obrigatório')
    .min(6, 'Senha precisa ter pelo menos 6 caracteres'),

  password2: yup
    .string()
    .required('Campo confirmar senha é obrigatório')
    .oneOf([yup.ref('password')], 'As senhas devem ser iguais'),
})

/* ===========================
   COMPONENT
=========================== */
const Register = () => {
  const navigate = useNavigate()

  const { handleSubmit, control } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  })

  const submission = async (data: RegisterFormData) => {
    try {
      await api.post('api/accounts/register/', {
        email: data.email,
        password: data.password,
      })

      navigate('/')
    } catch (error) {
      console.error(error)
      alert('Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <div className="myBackground">
      <form onSubmit={handleSubmit(submission)}>
        <Box className="whiteBox">
          <Box className="itemBox">
            <Box className="title">Registrar-se</Box>
          </Box>

          <Box className="itemBox">
            <FormTextField
              label="Email"
              name="email"
              control={control}
            />
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
              label="Confirmar Senha"
              name="password2"
              control={control}
            />
          </Box>

          <Box className="itemBox">
            <FormButton
              type="submit"
              label="Registrar"
            />
          </Box>

          <Box className="itemBox">
            <Link to="/">Já tem conta? Entre!</Link>
          </Box>
        </Box>
      </form>
    </div>
  )
}

export default Register
