import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import logger from './utils/logger'
import LandingPage from './pages/landing/landing'

function App() {
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    logger.info('Button clicked: Incrementing count');
    setCount((count) => {
      const newCount = count + 1;
      logger.info(`Count updated to: ${newCount}`);
      return newCount;
    });
  }

  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={
          <>
            <div>
              <a href="https://vitejs.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
              </a>
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
              <button onClick={handleIncrement}>
                count is {count}
              </button>
              <p>
                Edit <code>src/App.tsx</code> and save to test HMR
              </p>
            </div>
            <p className="read-the-docs">
              Click on the Vite and React logos to learn more
            </p>
            <Link 
              to="/landing" 
              className="mt-4 text-blue-500 hover:text-blue-700 underline"
            >
              Go to Landing Page
            </Link>
          </>
        } />
      </Routes>
    </Router>
  )
}

export default App
