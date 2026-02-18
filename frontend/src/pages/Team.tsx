import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import Item from '../components/Dragger'

const Team = () => {
  const nav = useNavigate()
  const link = import.meta.env.VITE_LINK
  const [hasOrg, setHasOrg] = useState(true)

  useEffect(() => {
    const checkOrg = async () => {
      try {
        await axios.get(`${link}/team`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
        })
        setHasOrg(true)
      } catch (err: unknown) {
        const e = err as { response?: { status?: number; data?: { message?: string } } }
        if (e?.response?.status === 400 && e?.response?.data?.message === 'User is not part of any organization') {
          setHasOrg(false)
        } else if (e?.response?.status === 401) {
          sessionStorage.removeItem('accessToken')
          nav('/login')
        }
      }
    }
    checkOrg()
  }, [link, nav])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Team Board</h1>
            <p className="text-slate-600 mt-1">Organize work across your organization.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/org/create"
              className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-semibold transition-colors duration-200"
            >
              Create organization
            </Link>
          </div>
        </div>
      </div>
      {!hasOrg && (
        <div className="max-w-3xl mx-auto mt-8 px-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h2 className="text-amber-800 font-semibold mb-1">No organization yet</h2>
            <p className="text-amber-700 text-sm">
              You're not part of any organization. Create one to start managing team tasks.
            </p>
          </div>
        </div>
      )}
      <Item dest="team" />
    </div>
  )
}

export default Team
