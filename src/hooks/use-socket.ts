import { useEffect } from 'react'
import { socket } from '@/lib/socket'
import { useAuthStore } from '@/store/use-auth-store'

export function useSocket() {
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('socket_token')

    if (user && isAuthenticated && token) {
      socket.auth = { token: `Bearer ${token}` }
      socket.connect()

      return () => {
        socket.disconnect()
      }
    }
  }, [user, isAuthenticated])

  return socket
} 