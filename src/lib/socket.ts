import { io } from 'socket.io-client'
import { env } from './env'

export const socket = io(env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket']
})