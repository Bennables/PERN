import axios from 'axios'
import { useNavigate } from 'react-router'

const Logout = () => {
  const link = import.meta.env.VITE_LINK
  const nav = useNavigate()

  const logoutClicked = () => {
    axios
      .post(
        `${link}/logout`,
        { token: sessionStorage.getItem('accessToken') },
        { withCredentials: true }
      )
      .catch((e: { response?: { data?: { message?: string } }; message?: string }) => {
        console.error('Logout error:', e?.response?.data?.message ?? e?.message)
      })
    sessionStorage.clear()
    nav('/login')
  }

  return (
    <button
      onClick={logoutClicked}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{ backgroundColor: '#cefaa0', color: '#2d5c0a' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b8f080')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#cefaa0')}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Log out
    </button>
  )
}

export default Logout
