import { useState, FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router'
import '../main.css'

const Register = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const orgName = sessionStorage.getItem('orgName') ?? ''
    const nav = useNavigate()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (username.trim() === '' || password.trim() === '') {
            console.log('One of these is empty')
            return
        }
        try {
            const link = import.meta.env.VITE_LINK
            console.log(orgName)
            const reply = await axios.post(`${link}/register`, {
                username,
                password,
                orgName: orgName || 1,
            })
            if (!reply) nav('/login')
        } catch (e: unknown) {
            const err = e as {
                response?: { data?: { message?: string } }
                message?: string
            }
            console.error(
                'Register error:',
                err?.response?.data?.message ?? err?.message
            )
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #cefad0 100%)' }}>
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#cefad0' }}>
                            <svg
                                className="h-6 w-6"
                                style={{ color: '#3a8c1a' }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Create Account
                        </h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Join us today and get started
                        </p>
                        {orgName && (
                            <p className="text-sm mt-2 font-medium" style={{ color: '#3a8c1a' }}>
                                Joining: {orgName}
                            </p>
                        )}
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="user"
                                type="text"
                                value={username ?? ''}
                                placeholder="Choose a username"
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cefad0] focus:border-[#5cb82e] transition-colors duration-200 bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="pass"
                                type="password"
                                value={password ?? ''}
                                placeholder="Create a secure password"
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cefad0] focus:border-[#5cb82e] transition-colors duration-200 bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#cefad0] focus:ring-offset-2 shadow-lg"
                            style={{ backgroundColor: '#5cb82e' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4a9e22')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#5cb82e')}
                        >
                            Create Account
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium transition-colors duration-200"
                                style={{ color: '#3a9c10' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#2d7a0c')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#3a9c10')}
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        © 2024 Your App. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
