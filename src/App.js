import './App.css';
import Loginpage from './components/Loginpage'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard';
import { useState, useEffect } from 'react';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'))

  const handleLogin = (token) => {
    localStorage.setItem('access_token', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setIsAuthenticated(false)
  }

  useEffect(() => {
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setIsAuthenticated(false)
        return
      }
      
      const response = await fetch('http://localhost:3000/verify', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.status === 401) {
        localStorage.removeItem('access_token')
        setIsAuthenticated(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      
      const data = await response.json()
      setIsAuthenticated(data.message === 'tokenIsValid')
      
    } catch (err) {
      console.error('Token verification failed:', err)
      localStorage.removeItem('access_token')
      setIsAuthenticated(false)
    }
  }
  
  verifyToken()
}, [])

  return (
    <>
      {isAuthenticated ?
        <Dashboard/>:
        <>
          <Signup onLogin={handleLogin} />
          <Loginpage onLogin={handleLogin} />
        </>
      }
    </>
  );
}

export default App;