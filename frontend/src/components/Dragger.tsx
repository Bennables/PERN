import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Drag from './drag'
import type { TaskItem, TaskBoardState, ApiError } from '../types'

const MAPPER: Record<number, 'low' | 'high' | 'any' | 'done'> = {
  1: 'low',
  2: 'high',
  3: 'any',
  4: 'done',
}

const ID_TO_LIST: Record<string, 'low' | 'high' | 'any'> = {
  droppable: 'low',
  droppable2: 'high',
  droppable3: 'any',
}

const move = (
  source: TaskItem[],
  destination: TaskItem[],
  droppableSource: { index: number; droppableId: string },
  droppableDestination: { index: number; droppableId: string },
  state: TaskBoardState,
  id2List: Record<string, 'low' | 'high' | 'any'>
): TaskBoardState => {
  const sourceClone = Array.from(source)
  const destClone = Array.from(destination)
  const [removed] = sourceClone.splice(droppableSource.index, 1)
  const urgencyMap: Record<string, number> = {
    low: 1,
    high: 2,
    any: 3,
    done: 4,
  }
  const destListName = id2List[droppableDestination.droppableId]
  if (removed) removed.urgency = urgencyMap[destListName]
  destClone.splice(droppableDestination.index, 0, removed)
  const result = { ...state }
  result[id2List[droppableSource.droppableId]] = sourceClone
  result[destListName] = destClone
  return result
}

const reorder = (list: TaskItem[], startIndex: number, endIndex: number): TaskItem[] => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

interface DragContextProps {
  dest: 'tasks' | 'team'
  compact?: boolean
}

const DragContext = ({ dest, compact }: DragContextProps) => {
  const link = import.meta.env.VITE_LINK
  const nav = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<TaskBoardState>({
    low: [],
    high: [],
    any: [],
  })

  const showNotification = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  const handleApiError = async (err: ApiError, context = 'request') => {
    console.error(`Error ${context}:`, err?.response?.data?.message ?? err?.message)
    if (!err?.response) {
      showNotification(
        context === 'update'
          ? 'Connection failed. Changes may not be saved.'
          : 'Connection failed. Check your internet connection.'
      )
      return
    }
    const status = err.response.status
    if (status === 401 || err.response?.data?.message === 'token expired') {
      try {
        const res = await axios.get(`${link}/auth/refresh`, { withCredentials: true })
        sessionStorage.setItem('accessToken', res.data.token)
        if (context === 'fetching tasks') window.location.reload()
      } catch (refreshErr: unknown) {
        const e = refreshErr as ApiError
        console.error('Refresh token failed:', e?.response?.data?.message ?? e?.message)
        if (e?.response?.data?.message === "token doesn't exist") {
          sessionStorage.removeItem('accessToken')
        }
        showNotification('Session expired. Please login again.')
        nav('/login')
      }
    } else if (status === 403) {
      showNotification('Access denied. Redirecting to login...')
      setTimeout(() => nav('/login'), 2000)
    } else if (status === 400) {
      showNotification(
        context === 'update'
          ? 'Invalid data sent. Changes not saved.'
          : 'Invalid request. Please check your data.'
      )
    } else if (status === 404) {
      showNotification('Service temporarily unavailable.')
    } else if (status === 429) {
      showNotification(
        context === 'update'
          ? 'Too many updates. Please wait before making more changes.'
          : 'Too many requests. Please wait a moment before trying again.'
      )
    } else if (status >= 500) {
      showNotification(
        context === 'update'
          ? 'Server error. Changes may not be saved.'
          : 'Server error. Please try again later.'
      )
    } else {
      showNotification(
        context === 'update' ? 'Failed to save changes.' : 'An unexpected error occurred.'
      )
    }
  }

  const getList = (id: string): TaskItem[] => state[ID_TO_LIST[id]] ?? []

  useEffect(() => {
    const getData = async () => {
      if (loaded) return
      if (!link) {
        console.error('VITE_LINK environment variable is not defined')
        return
      }
      try {
        const res = await axios.get(`${link}/${dest}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
          withCredentials: true,
        })
        const tasks = res.data?.tasks && Array.isArray(res.data.tasks) ? res.data.tasks : []
        const newState: TaskBoardState = { low: [], high: [], any: [], done: [] }
        for (let i = 0; i < tasks.length; i++) {
          const task = tasks[i] as TaskItem & { task?: TaskItem }
          const taskId = task?.task_id ?? task?.task?.ID ?? task?.id
          if (!task || taskId == null) continue
          const flat = task.task ? { ...task, ...task.task } : task
          const normalizedTask = { ...flat, task_id: taskId }
          const urgency = normalizedTask.urgency ?? 1
          const key = MAPPER[urgency] ?? 'low'
          if (newState[key]) newState[key].push(normalizedTask)
          else newState.low.push(normalizedTask)
        }
        setState(newState)
        setLoaded(true)
      } catch (err) {
        handleApiError(err as ApiError, 'fetching tasks')
      }
    }
    getData()
  }, [dest])

  useEffect(() => {
    const update = async () => {
      if (!loaded || Object.keys(state).length === 0) return
      const token = sessionStorage.getItem('accessToken')
      const data2: { task_id: number; urgency: number; index: number }[] = []
      const keys: ('low' | 'high' | 'any' | 'done')[] = ['low', 'high', 'any', 'done']
      keys.forEach((key, ind) => {
        const list = state[key]
        if (list) {
          list.forEach((task, taskIndex) => {
            const taskId = task?.task_id ?? task?.id
            if (taskId == null) return
            data2.push({
              task_id: taskId,
              urgency: task.urgency ?? ind + 1,
              index: taskIndex,
            })
          })
        }
      })
      const endpoint = dest === 'team' ? '/team/tasks' : '/tasks'
      try {
        await axios.put(`${link}${endpoint}`, data2, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
      } catch (err) {
        handleApiError(err as ApiError, 'update')
      }
    }
    update()
  }, [state, loaded, dest])

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId) {
      const items = reorder(getList(source.droppableId), source.index, destination.index)
      let newState = { ...state }
      if (source.droppableId === 'droppable') newState = { ...state, low: items }
      if (source.droppableId === 'droppable2') newState = { ...state, high: items }
      if (source.droppableId === 'droppable3') newState = { ...state, any: items }
      setState(newState)
    } else {
      const newResult = move(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination,
        state,
        ID_TO_LIST
      )
      setState({
        low: newResult.low,
        high: newResult.high,
        any: newResult.any,
      })
    }
  }

  if (!link) {
    return <div>Configuration error. Please check environment variables.</div>
  }

  if (!loaded) {
    return (
      <div
        className={`${compact ? '' : 'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading your tasks...</p>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  const wrapperClassName = compact ? '' : 'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'

  return (
    <div className={wrapperClassName}>
      {error && (
        <div className={`${compact ? '' : 'fixed top-4 right-4'} z-50 max-w-sm`}>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex justify-between items-start">
              <span className="text-sm">{error}</span>
              <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      {!compact && (
        <>
          <div className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Task Board</h1>
                  <p className="text-slate-600 mt-1">Organize your tasks by priority</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-slate-700">
                      {(state.low?.length ?? 0) + (state.high?.length ?? 0) + (state.any?.length ?? 0)} tasks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mr-53">
            <button
              className="border-0 bg-blue-100 font-serif font-bold text-blue-700 mt-6 p-5 rounded-xl"
              onClick={() => nav('/create')}
            >
              add task+
            </button>
          </div>
        </>
      )}
      <div className={compact ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-green-50 border-b border-green-100 px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <h2 className="text-lg font-semibold text-green-800">Low Priority</h2>
                  </div>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {state.low?.length ?? 0}
                  </span>
                </div>
                <p className="text-green-600 text-sm mt-1">Tasks that can be done when time permits</p>
              </div>
              <div className="p-2">
                <Drag id="droppable" state={state.low ?? []} urgencyColor="green" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-orange-50 border-b border-orange-100 px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <h2 className="text-lg font-semibold text-orange-800">High Priority</h2>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {state.high?.length ?? 0}
                  </span>
                </div>
                <p className="text-orange-600 text-sm mt-1">Important tasks that need attention soon</p>
              </div>
              <div className="p-2">
                <Drag id="droppable2" state={state.high ?? []} urgencyColor="orange" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <h2 className="text-lg font-semibold text-blue-800">Flexible</h2>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {state.any?.length ?? 0}
                  </span>
                </div>
                <p className="text-blue-600 text-sm mt-1">Tasks that can be done at any time</p>
              </div>
              <div className="p-2">
                <Drag id="droppable3" state={state.any ?? []} urgencyColor="blue" />
              </div>
            </div>
          </div>
        </DragDropContext>
      </div>
      {!compact && (
        <div className="bg-white border-t border-slate-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-slate-500 text-sm">
              Drag and drop tasks between sections to change their priority
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DragContext
