import { useMutation, useQuery } from '@tanstack/react-query'
import { LoginDto, RegisterDto, User } from '@/types/auth'
import { useAuthStore } from '@/store/use-auth-store'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'

export const useLogin = () => {
  const router = useRouter()
  const setUser = useAuthStore(state => state.setUser)

  return useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await api.post<{ user: User }>('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      setUser(data.user)
      router.push('/')
    }
  })
}

export const useRegister = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      const response = await api.post('/auth/register', data)
      return response.data
    },
    onSuccess: () => {
      router.push('/login')
    }
  })
}

export const useLogout = () => {
  const router = useRouter()
  const clearUser = useAuthStore(state => state.clearUser)

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      clearUser()
      router.push('/login')
    }
  })
}

export const useProfile = () => {
  const router = useRouter()
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const response = await api.get<User>('/auth/profile')
        return response.data
      } catch (error) {
        // Nếu lỗi 401, xóa user và redirect về login
        if (error.response?.status === 401) {
          clearUser()
          router.push('/login')
        }
        throw error
      }
    },
    onSuccess: (data) => {
      setUser(data)
    },
    onError: () => {
      clearUser()
    },
    // Chỉ fetch khi không có user data hoặc chưa authenticated
    enabled: !user || !isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
} 