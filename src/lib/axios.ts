import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
})

// Add response interceptor để xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
) 