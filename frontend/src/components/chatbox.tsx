import { useEffect, useState } from 'react'
import {
  joinConversation,
  sendMessage,
  onNewMessage,
  type NewMessagePayload,
} from '../lib/socket'

interface ChatboxProps {
  conversationId: string
  senderId?: string
}

export default function Chatbox({ conversationId, senderId }: ChatboxProps) {
  const [messages, setMessages] = useState<NewMessagePayload[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    joinConversation(conversationId)
    const unsubscribe = onNewMessage((message) => {
      setMessages((prev) => [...prev, message])
    })
    return unsubscribe
  }, [conversationId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(conversationId, input.trim(), senderId)
    setInput('')
  }

  return (
    <div className="flex flex-col border rounded-lg p-4 max-w-md">
      <ul className="space-y-2 mb-4 min-h-[120px] max-h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <li key={i} className="text-sm">
            <span className="font-medium">{m.senderId ?? 'Someone'}: </span>
            {m.text}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Send
        </button>
      </form>
    </div>
  )
}
