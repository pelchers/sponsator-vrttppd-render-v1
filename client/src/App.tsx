import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'
import "@/styles/globals.css"
import "@/components/input/forms/ProjectEditFormV3.css"

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
