import axios from 'axios'
import { API_URL } from '@/config'

const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  },
})

// Add response interceptor để xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa token và redirect to login if unauthorized
      localStorage.removeItem('token')
      localStorage.removeItem('socket_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
) 