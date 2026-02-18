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

  return <button onClick={logoutClicked}>LOG OUT</button>
}

export default Logout
