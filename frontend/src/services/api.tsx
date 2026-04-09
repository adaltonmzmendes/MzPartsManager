import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'

// O Nginx já atua como proxy reverso roteando "/api/" para o container web:8000.
// Usar "/" previne o erro de CORS porque o navegador enxerga apenas a origem do frontend.
const api: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Tipagem atualizada para InternalAxiosRequestConfig para suprir exigência das versões recentes do Axios.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('Token')

    if (token) {
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
    if (error.response?.status === 401) {
      localStorage.removeItem('Token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api