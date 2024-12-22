import { useEffect } from 'react'
import { socket } from '@/lib/socket'
import { useAuthStore } from '@/store/use-auth-store'

function getCookie(name: string) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue
  }
  return null
}

export function useSocket() {
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const token = getCookie('socket_token')

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