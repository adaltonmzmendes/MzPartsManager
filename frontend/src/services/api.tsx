import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'

const baseUrl = 'http://127.0.0.1:8000/'

const api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('Token')

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Token ${token}`,
      }
    } else if (config.headers) {
      delete config.headers.Authorization
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
