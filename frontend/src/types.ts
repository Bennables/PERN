export interface TaskItem {
  task_id: number
  task_name?: string
  deadline?: string
  description?: string
  urgency?: number
  owner_id?: number
  org_id?: number
  id?: number
  ID?: number
  task?: TaskItem
}

export interface OrderingTaskItem extends Omit<TaskItem, 'task'> {
  task?: { ID: number; task_name?: string; deadline?: string; description?: string; urgency?: number }
}

export interface Subtask {
  ID: number
  description: string | null
  task_id?: number
}

export interface TaskBoardState {
  low: TaskItem[]
  high: TaskItem[]
  any: TaskItem[]
  done?: TaskItem[]
}

export type UrgencyColorKey = 'green' | 'orange' | 'blue'

export interface ApiError {
  response?: { status: number; data?: { message?: string } }
  message?: string
}
