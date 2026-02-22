import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router'
import Login from './pages/Login.js'
import './main.css'
import Register from './pages/Register.js'
import Personal from './pages/Personal.js'
import Item from './components/Dragger.js'
import Team from './pages/Team.js'
import Create from './pages/Create.js'
import OrgCreate from './pages/OrgCreate.js'
import OrgFind from './pages/OrgFind.js'
import TaskView from './pages/TaskView.js'
import Chatbox from './components/d.js'

const router = createBrowserRouter([
    { path: '/', element: <OrgFind /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/team', element: <Team /> },
    { path: '/personal', element: <Personal /> },
    { path: '/drag', element: <Item dest="tasks" /> },
    { path: '/create', element: <Create /> },
    { path: '/org/create', element: <OrgCreate /> },
    { path: '/org/find', element: <OrgFind /> },
    { path: '/tasks/:id', element: <TaskView /> },
    { path: '/chat/:id', element: <Chatbox /> },

    { path: '/logout' },
])

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
)
