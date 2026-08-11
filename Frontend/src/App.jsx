import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/home'
import Login from './pages/login'
import Navbar from './pages/navbar'
import Register from './pages/register'

function AppRoutes() {
  const { pathname } = useLocation()
  const hideNavbar = pathname === '/login' || pathname === '/register'

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App
