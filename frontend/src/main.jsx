import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { RouterProvider, createBrowserRouter } from 'react-router';
import Login from './pages/Login';
import "./main.css";
import Register from './pages/Register';
import Personal from './pages/Personal';
import Item from './components/Dragger';
import Team from './pages/Team';
import Create from './pages/Create';



const router = createBrowserRouter([
  {path:"/", element:<Login/>},
  {path: "/login", element: <Login/>},
  {path: "/register", element: <Register/>},
  {path: "/team", element: <Team/>},
  {path: "/personal", element: <Personal/>},
  {path:"/drag", element: <Item/>},
  {path:"/create", element: <Create/>},
  {path:"/logout"}

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router}/>
  </StrictMode>,
)
