import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'
import "@/styles/globals.css"
import "@/components/input/forms/ProjectEditFormV3.css"
import MessagesListPage from './pages/messages/MessagesListPage';
import ChatPage from './pages/messages/ChatPage';

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
