import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// Define a URL dinamicamente:
// 1. Tenta pegar do .env (se existir)
// 2. Se não existir, verifica se é localhost e usa a porta 8000 local
// 3. Se estiver na nuvem, aponta para o IP da VPS na porta 8000
const apiURL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:8000' : 'http://72.61.135.158:8000')

const api: AxiosInstance = axios.create({
  baseURL: apiURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('Token')
    const isAuthRoute = config.url?.includes('/accounts/login') || config.url?.includes('/accounts/register')

    if (token && !isAuthRoute) {
      config.headers.set('Authorization', `Token ${token}`)
    } else {
      config.headers.delete('Authorization')
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const isAuthRoute = error.config?.url?.includes('/accounts/login')

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('Token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api