import { io } from 'socket.io-client'

const socketUrl = import.meta.env.VITE_LINK ?? 'http://localhost:3333'
const socket = io(socketUrl, { withCredentials: true })

export type NewMessagePayload = {
  conversationId: string
  text: string
  senderId?: string
}

export function joinConversation(conversationId: string): void {
  socket.emit('conversation:join', { conversationId })
}

export function sendMessage(
  conversationId: string,
  text: string,
  senderId?: string
): void {
  socket.emit('message:send', { conversationId, text, senderId })
}

export function onNewMessage(callback: (message: NewMessagePayload) => void): () => void {
  socket.on('message:new', callback)
  return () => {
    socket.off('message:new', callback)
  }
}

export { socket }
