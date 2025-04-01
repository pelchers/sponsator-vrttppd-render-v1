import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'
import "@/styles/globals.css"
import "@/components/input/forms/ProjectEditFormV3.css"
import MessagesListPage from './pages/messages/MessagesListPage';
import ChatPage from './pages/messages/ChatPage';
import Layout from './components/layout/Layout';
import SuggestionsPage from './pages/suggestions/SuggestionsPage';
import SuggestionDetail from './pages/suggestions/SuggestionDetail';

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
