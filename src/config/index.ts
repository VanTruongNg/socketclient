import { env } from '@/lib/env'

export const API_URL = env.NEXT_PUBLIC_API_URL;
export const SOCKET_URL = env.NEXT_PUBLIC_SOCKET_URL;

export const ICE_SERVERS = [
  {
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
      'stun:stun3.l.google.com:19302',
      'stun:stun4.l.google.com:19302',
    ],
  },
]; 