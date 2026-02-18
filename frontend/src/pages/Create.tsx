import axios from 'axios'
import React, { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router'
import './Create.css'

const MONTH_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const MAP_MONTH: Record<(typeof MONTH_LIST)[number], number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}
const THIRTY_ONE_DAYS = [1, 3, 5, 7, 8, 10, 12]
const THIRTY_DAYS = [4, 6, 9, 11]

const Create = () => {
  const nav = useNavigate()
  const link = import.meta.env.VITE_LINK
  const [name, setName] = useState('')
  const [scope, setScope] = useState<'personal' | 'team'>('personal')
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [urgency, setUrgency] = useState(1)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a task name')
      return
    }
    const orgId = sessionStorage.getItem('orgId')
    if (scope === 'team' && (!orgId || orgId === 'null' || orgId === 'undefined')) {
      alert('No organization selected. Please pick your org first.')
      nav('/org/find')
      return
    }
    const data = {
      name: name.trim(),
      scope,
      deadline: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      urgency: Number(urgency),
      org_id: scope === 'team' ? Number(orgId) : undefined,
    }
    try {
      const token = sessionStorage.getItem('accessToken')
      let response: { data: unknown } | undefined
      try {
        response = await axios.post(`${link}/create`, data, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        })
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } }
        const message = e?.response?.data?.message
        if (message === 'token expired') {
          const refreshRes = await axios.get(`${link}/auth/refresh`, { withCredentials: true })
          sessionStorage.setItem('accessToken', refreshRes.data.token)
          const retryToken = sessionStorage.getItem('accessToken')
          response = await axios.post(`${link}/create`, data, {
            headers: { Authorization: `Bearer ${retryToken}` },
            withCredentials: true,
          })
        } else if (message === 'bad token' || message === "token doesn't exist") {
          sessionStorage.removeItem('accessToken')
          nav('/login')
          return
        } else {
          throw err
        }
      }
      void response
      alert('Task created successfully!')
      setName('')
      nav('/personal')
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } } }
      if (e?.response) {
        alert(`Error: ${e.response.data?.message ?? 'Failed to create task'}`)
      } else {
        alert('Network error. Please try again.')
      }
    }
  }

  const countMonths = () => {
    let days: number
    if (THIRTY_ONE_DAYS.includes(month)) days = 31
    else if (THIRTY_DAYS.includes(month)) days = 30
    else {
      const isLeap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
      days = isLeap ? 29 : 28
    }
    const options: React.ReactElement[] = []
    for (let i = 1; i <= days; i++) {
      options.push(<option key={i} value={i}>{i}</option>)
    }
    return options
  }

  const countYears = () => {
    const options: React.ReactElement[] = []
    const yearNum = new Date().getFullYear()
    for (let i = yearNum; i < yearNum + 10; i++) {
      options.push(<option key={i} value={i}>{i}</option>)
    }
    return options
  }

  const handleMonthChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as (typeof MONTH_LIST)[number]
    if (value in MAP_MONTH) setMonth(MAP_MONTH[value])
  }

  return (
    <div className="create-container">
      <div className="create-card">
        <h1>Create New Task</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group form-group-full">
            <label htmlFor="name">Task Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={name ?? ''}
              placeholder="Enter task name..."
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group form-group-full">
            <label>Task Type</label>
            <div className="scope-group">
              <div className="scope-option">
                <input
                  id="personal"
                  type="radio"
                  name="scope"
                  value="personal"
                  checked={scope === 'personal'}
                  onChange={(e) => setScope(e.target.value as 'personal' | 'team')}
                />
                <label htmlFor="personal">Personal</label>
              </div>
              <div className="scope-option">
                <input
                  id="team"
                  type="radio"
                  name="scope"
                  value="team"
                  checked={scope === 'team'}
                  onChange={(e) => setScope(e.target.value as 'personal' | 'team')}
                />
                <label htmlFor="team">Team</label>
              </div>
            </div>
          </div>
          <div className="date-section">
            <label>Deadline</label>
            <div className="form-row-three">
              <div className="form-group">
                <label htmlFor="month">Month</label>
                <select id="month" value={MONTH_LIST[month - 1]} onChange={handleMonthChange} name="month">
                  {MONTH_LIST.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="day">Day</label>
                <select id="day" name="day" value={day} onChange={(e) => setDay(Number(e.target.value))}>
                  {countMonths()}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <select id="year" name="year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {countYears()}
                </select>
              </div>
            </div>
          </div>
          <div className="form-group form-group-full">
            <label htmlFor="urgency">Priority Level</label>
            <select id="urgency" name="urgency" value={urgency} onChange={(e) => setUrgency(Number(e.target.value))}>
              <option value={3}>🔥 Super High</option>
              <option value={2}>📌 Medium</option>
              <option value={1}>✓ Low</option>
            </select>
          </div>
          <button type="submit" className="submit-button">Create Task</button>
        </form>
      </div>
    </div>
  )
}

export default Create
