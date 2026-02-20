import axios from 'axios'
import { useEffect, useState, FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import type { Subtask } from '../types'

interface TaskDetail {
  ID?: number
  task_name: string
  description?: string | null
  deadline?: string | null
  urgency?: number
}

const URGENCY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Low', color: 'bg-blue-100 text-blue-800' },
  2: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  3: { label: 'Any Time', color: 'bg-gray-100 text-gray-800' },
  4: { label: 'Done', color: 'bg-green-100 text-green-800' },
}

const TaskView = () => {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const link = import.meta.env.VITE_LINK
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newSubtask, setNewSubtask] = useState('')
  const [editingSubtask, setEditingSubtask] = useState<number | null>(null)
  const [editDescription, setEditDescription] = useState('')

  const handleApiError = async (err: unknown, context = 'request') => {
    const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
    console.error(`Error ${context}:`, e?.response?.data?.message ?? e?.message)
    if (!e?.response) {
      setError('Connection failed. Check your internet connection.')
      return
    }
    const status = e.response.status
    if (status === 401 || e.response?.data?.message === 'token expired') {
      try {
        const res = await axios.get(`${link}/auth/refresh`, { withCredentials: true })
        sessionStorage.setItem('accessToken', res.data.token)
        window.location.reload()
      } catch {
        sessionStorage.removeItem('accessToken')
        nav('/login')
      }
    } else if (status === 403 || status === 404) {
      setError('Task not found or access denied')
    } else {
      setError('An error occurred. Please try again.')
    }
  }

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!id) return
      try {
        const token = sessionStorage.getItem('accessToken')
        const taskRes = await axios.get(`${link}/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
        setTask(taskRes.data.task)
        const subtasksRes = await axios.get(`${link}/tasks/${id}/subtasks`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
        setSubtasks(subtasksRes.data.subtasks ?? [])
      } catch (err) {
        handleApiError(err, 'fetching task')
      } finally {
        setLoading(false)
      }
    }
    fetchTaskDetails()
  }, [id, link, nav])

  const handleAddSubtask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newSubtask.trim() || !id) return
    try {
      const token = sessionStorage.getItem('accessToken')
      const res = await axios.post(
        `${link}/subtasks`,
        { task_id: Number(id), description: newSubtask },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      )
      setSubtasks([...subtasks, res.data.subtask])
      setNewSubtask('')
    } catch (err) {
      handleApiError(err, 'creating subtask')
    }
  }

  const handleUpdateSubtask = async (subtaskId: number) => {
    try {
      const token = sessionStorage.getItem('accessToken')
      const res = await axios.put(
        `${link}/subtasks/${subtaskId}`,
        { description: editDescription },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      )
      setSubtasks(subtasks.map((st) => (st.ID === subtaskId ? res.data.subtask : st)))
      setEditingSubtask(null)
      setEditDescription('')
    } catch (err) {
      handleApiError(err, 'updating subtask')
    }
  }

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (!confirm('Delete this subtask?')) return
    try {
      const token = sessionStorage.getItem('accessToken')
      await axios.delete(`${link}/subtasks/${subtaskId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      setSubtasks(subtasks.filter((st) => st.ID !== subtaskId))
    } catch (err) {
      handleApiError(err, 'deleting subtask')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading task...</div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error ?? 'Task not found'}</p>
          <Link to="/personal" className="text-indigo-600 hover:text-indigo-700">
            ← Back to tasks
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-1/2 fixed left-0 top-0 h-screen overflow-y-auto bg-white border-r border-slate-200">
        <div className="p-8">
          <div className="mb-6">
            <Link to="/personal" className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
              ← Back to tasks
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{task.task_name}</h1>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  URGENCY_LABELS[task.urgency ?? 1]?.color ?? 'bg-gray-100 text-gray-800'
                }`}
              >
                {URGENCY_LABELS[task.urgency ?? 1]?.label ?? 'Unknown'}
              </span>
              {task.deadline && (
                <span className="text-sm text-slate-600">
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {task.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Description</h2>
              <p className="text-slate-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Subtasks</h2>
            <form onSubmit={handleAddSubtask} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Add
                </button>
              </div>
            </form>
            <div className="space-y-2">
              {subtasks.length === 0 ? (
                <p className="text-slate-500 text-sm">No subtasks yet</p>
              ) : (
                subtasks.map((subtask) => (
                  <div
                    key={subtask.ID}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    {editingSubtask === subtask.ID ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="flex-1 px-2 py-1 border border-slate-300 rounded"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateSubtask(subtask.ID)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubtask(null)
                            setEditDescription('')
                          }}
                          className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm hover:bg-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-slate-700">{subtask.description ?? '(No description)'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubtask(subtask.ID)
                              setEditDescription(subtask.description ?? '')
                            }}
                            className="text-indigo-600 hover:text-indigo-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(subtask.ID)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2 fixed right-0 top-0 h-screen overflow-y-auto bg-slate-50">
        <div className="p-8">
          <div className="text-slate-500 text-center mt-20">
            <p>Additional information can go here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskView
