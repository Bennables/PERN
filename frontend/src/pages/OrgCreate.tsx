import { useState, FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router'

const OrgCreate = () => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const link = import.meta.env.VITE_LINK

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Organization name is required')
      return
    }
    try {
      setLoading(true)
      await axios.post(
        `${link}/org`,
        { name: trimmed },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
          withCredentials: true,
        }
      )
      nav('/team')
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } }
      if (e?.response) {
        if (e.response.status === 400 && e.response.data?.message) {
          setError(e.response.data.message)
        } else if (e.response.status === 401) {
          setError('Session expired. Please login again.')
          nav('/login')
        } else {
          setError(e.response?.data?.message ?? 'Failed to create organization')
        }
      } else {
        setError('Network error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #cefad0 100%)' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#cefad0' }}>
              <svg className="h-6 w-6" style={{ color: '#3a8c1a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4m-9 4l9-4m-9 4v10M4 10v10m16-10v10" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Organization</h2>
            <p className="text-sm text-gray-600 mt-2">Create a new team workspace and become its first member.</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-2">
                Organization name
              </label>
              <input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Product Squad Alpha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cefad0] focus:border-[#5cb82e] transition-colors duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#cefad0] focus:ring-offset-2 shadow-lg"
              style={{ backgroundColor: '#5cb82e' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#4a9e22' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#5cb82e' }}
            >
              {loading ? 'Creating...' : 'Create organization'}
            </button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already in a team?{' '}
              <Link to="/team" className="font-medium transition-colors duration-200" style={{ color: '#3a9c10' }} onMouseEnter={e => (e.currentTarget.style.color = '#2d7a0c')} onMouseLeave={e => (e.currentTarget.style.color = '#3a9c10')}>
                View team board
              </Link>
            </p>
            <p className="text-xs text-gray-500">You'll automatically be added as a member of the organization you create.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrgCreate
