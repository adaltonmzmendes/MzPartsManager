import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'

// A MÁGICA ESTÁ AQUI: Verifica se é o seu PC ou a VPS
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const apiURL = isLocalhost ? 'http://localhost:8000' : '/'

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