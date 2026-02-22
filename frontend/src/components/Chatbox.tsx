import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'http://127.0.0.1:3333'

export interface ChatMessage {
    id: string
    text: string
    senderId?: string
    senderName?: string
    createdAt?: string
    isOwn?: boolean
}

export default function Chatbox(props: any) {
    const socketRef = useRef<Socket | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [connectionStatus, setConnectionStatus] = useState<
        'connected' | 'connecting' | 'disconnected'
    >('disconnected')
    const convoId = props.taskId

    useEffect(() => {
        setConnectionStatus('connecting')
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
        })
        socketRef.current = socket

        socket.on('connect', () => {
            setConnectionStatus('connected')
            if (convoId) {
                socket.emit('chat:join', convoId)
            }
        })

        socket.on('disconnect', () => {
            setConnectionStatus('disconnected')
        })

        socket.on(
            'chat:message',
            (data: {
                text?: string
                message?: string
                senderId?: string
                senderName?: string
                senderSocketId?: string
                createdAt?: string
            }) => {
                const text = data.text ?? data.message ?? ''
                if (!text) return
                // Skip echo of our own message (we added it optimistically)
                if (data.senderSocketId === socket.id) return
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                        text,
                        isOwn: false,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        createdAt: data.createdAt ?? new Date().toISOString(),
                    },
                ])
            }
        )

        return () => {
            socket.removeAllListeners()
            socket.disconnect()
            socketRef.current = null
        }
    }, [convoId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = () => {
        const trimmed = input.trim()
        const socket = socketRef.current
        if (!trimmed || !socket?.connected) return

        socket.emit('chat:message', {
            convoId: convoId || undefined,
            text: trimmed,
        })
        setMessages((prev) => [
            ...prev,
            {
                id: `msg-${Date.now()}`,
                text: trimmed,
                isOwn: true,
                createdAt: new Date().toISOString(),
            },
        ])
        setInput('')
    }

    return (
        <div className="flex flex-col h-full min-h-0 w-full max-w-full rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
                        Chat
                    </h2>
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            connectionStatus === 'connected'
                                ? 'bg-emerald-100 text-emerald-800'
                                : connectionStatus === 'connecting'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                connectionStatus === 'connected'
                                    ? 'bg-emerald-500'
                                    : connectionStatus === 'connecting'
                                      ? 'bg-amber-500 animate-pulse'
                                      : 'bg-slate-400'
                            }`}
                        />
                        {connectionStatus}
                    </span>
                </div>
            </div>

            {/* Message list - scrollable, grows to fill */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-slate-400">
                        <svg
                            className="w-10 h-10 mb-2 opacity-60"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs mt-0.5">
                            Messages will appear here
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                    msg.isOwn
                                        ? 'bg-indigo-600 text-white rounded-br-md'
                                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-md shadow-sm'
                                }`}
                            >
                                {!msg.isOwn &&
                                    (msg.senderName || msg.senderId) && (
                                        <p className="text-xs font-medium opacity-90 mb-0.5">
                                            {msg.senderName ?? msg.senderId}
                                        </p>
                                    )}
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.text}
                                </p>
                                {msg.createdAt && (
                                    <p
                                        className={`text-[10px] mt-1 ${
                                            msg.isOwn
                                                ? 'text-indigo-200'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        {new Date(
                                            msg.createdAt
                                        ).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area - fixed at bottom */}
            <div className="flex-shrink-0 p-3 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                sendMessage()
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-colors"
                    />
                    <button
                        type="button"
                        onClick={sendMessage}
                        disabled={
                            !input.trim() || connectionStatus !== 'connected'
                        }
                        className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
