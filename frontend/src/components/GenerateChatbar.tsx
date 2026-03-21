import axios from 'axios'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface GeneratedTask {
    task_name: string
    description?: string
}

import type { Subtask } from '../types.js'

interface GenerateChatbarProps {
    taskId?: string
    link: string
    onGenerated?: (subtasks: Subtask[]) => void
}

export default function GenerateChatbar({ taskId, link, onGenerated }: GenerateChatbarProps) {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        const trimmed = input.trim()
        if (!trimmed || loading) return

        const userMsg = { role: 'user' as const, content: trimmed }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const token = sessionStorage.getItem('accessToken')
            const res = await axios.post(
                `${link}/generate-tasks`,
                { task_id: taskId ? Number(taskId) : undefined, prompt: trimmed },
                { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
            )

            const data = res.data
            let responseText = ''

            if (Array.isArray(data.tasks)) {
                responseText = (data.tasks as GeneratedTask[])
                    .map((t, i) => `${i + 1}. **${t.task_name}**${t.description ? `\n   ${t.description}` : ''}`)
                    .join('\n')
                if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
                    onGenerated?.(data.subtasks)
                }
            } else if (typeof data.message === 'string') {
                responseText = data.message
            } else {
                responseText = JSON.stringify(data, null, 2)
            }

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: responseText },
            ])
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } }; message?: string }
            const errMsg = e?.response?.data?.message ?? e?.message ?? 'Something went wrong.'
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `Error: ${errMsg}` },
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-full min-h-0 w-full rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Generate Tasks</h2>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[80px] text-slate-400">
                        <svg className="w-8 h-8 mb-2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p className="text-xs font-medium">Describe what tasks to generate</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
                                    msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-br-md'
                                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-md shadow-sm'
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                            <div className="flex gap-1 items-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-3 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Break this task into 3 subtasks..."
                        disabled={loading}
                        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 focus:bg-white transition-colors disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
    )
}
