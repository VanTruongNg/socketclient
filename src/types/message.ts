import { User } from './auth'

export type MessageType = "TEXT" | "EMOJI" | "IMAGE" | "FILE";

export interface FileAttachment {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface Message {
  _id: string
  chatroom: string
  sender: User
  content: string
  type: MessageType
  emojis?: string[]
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileMimeType?: string
  createdAt: string
  updatedAt: string
  file?: FileAttachment;
} 