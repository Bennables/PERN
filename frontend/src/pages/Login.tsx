import { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router'
import '../main.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (username.trim() === '' || password.trim() === '') {
        console.log('INVALID VALUE. PLEASE TRY AGAIN')
        return
      }
      const link = import.meta.env.VITE_LINK
      const res = await axios.post(
        `${link}/login`,
        { username, password },
        { withCredentials: true }
      )
      if (res.data.message === 'correct') {
        sessionStorage.setItem('accessToken', res.data.token)
        nav('/personal')
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      console.error('Login error:', err?.response?.data?.message ?? err?.message)
    }
  }

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')
    if (token != null) nav('/personal')
  }, [nav])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(135deg, #f7fef2 0%, #dffac8 50%, #cefaa0 100%)' }}>
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white rounded-3xl shadow-lg shadow-green-100 p-8 border border-[#e8fdd0]">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: '#cefaa0' }}>
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#3a7d0a" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="user"
                type="text"
                value={username ?? ''}
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 bg-[#fafffe] transition-all duration-200 outline-none"
                style={{ boxShadow: 'none' }}
                onFocus={e => e.target.style.borderColor = '#cefaa0'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="pass"
                type="password"
                value={password ?? ''}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 bg-[#fafffe] transition-all duration-200 outline-none"
                onFocus={e => e.target.style.borderColor = '#cefaa0'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <button
              type="submit"
              className="w-full font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-white shadow-md mt-2"
              style={{ backgroundColor: '#5cb82e' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4a9e22')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#5cb82e')}
            >
              Sign In
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium transition-colors duration-200"
                style={{ color: '#3a9c10' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#2d7a0c')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3a9c10')}
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">© 2024 Your App. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
