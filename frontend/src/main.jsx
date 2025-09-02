import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { RouterProvider, createBrowserRouter } from 'react-router';
import Login from './pages/Login';
import "./main.css";
import Register from './pages/Register';
import Personal from './pages/Personal';
import Item from './components/Dragger';



const router = createBrowserRouter([
  {path:"/", element:<Login/>},
  {path: "/login", element: <Login/>},
  {path: "/register", element: <Register/>},
  // {path: "/group", element: <GroupBoard/>},
  {path: "/personal", element: <Personal/>},
  {path:"/drag", element: <Item/>}
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router}/>
  </StrictMode>,
)
