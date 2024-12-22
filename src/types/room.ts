import { User } from './auth'

export type RoomType = 'PRIVATE' | 'GROUP';

export interface LastMessage {
  content: string
  sender: User
  timestamp: string
}

export interface Room {
  _id: string
  name: string
  type: RoomType
  participants: User[]
  createdBy: User
  createdAt: string
  updatedAt: string
  lastMessage?: LastMessage
} 