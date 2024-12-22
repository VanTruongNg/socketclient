import { useSocket } from './use-socket'
import { useCallback, useState, useEffect } from 'react'
import { Message } from '@/types/message'

export function useRoom() {
  const socket = useSocket()
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!socket) return

    socket.on('message:new', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.off('message:new')
    }
  }, [socket])

  const createPrivateRoom = useCallback((userId: string) => {
    if (!socket) return
    socket.emit('room:create', { userId })
  }, [socket])

  const sendMessage = useCallback((roomId: string, content: string) => {
    if (!socket) return
    socket.emit('message:send', { roomId, content })
  }, [socket])

  const loadMessages = useCallback(async (roomId: string) => {
    if (!socket) return
    socket.emit('room:messages', { roomId, page: 1, limit: 20 })
  }, [socket])

  return {
    messages,
    createPrivateRoom,
    sendMessage,
    loadMessages
  }
} 