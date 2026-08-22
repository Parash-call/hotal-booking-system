import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

  return (
    <header>
      <h1>Hotel Booking System</h1>
      <nav>
        <NavLink to="/" className={linkClass}>Home</NavLink>
        <NavLink to="/rooms" className={linkClass}>Rooms</NavLink>
        <NavLink to="/booking" className={linkClass}>Booking</NavLink>
        <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={linkClass}>Admin</NavLink>
        )}
        <NavLink to="/contact" className={linkClass}>Contact</NavLink>
        {user ? (
          <span className="nav-user">
            Hi, {user.name}
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </span>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink to="/register" className={linkClass}>Register</NavLink>
          </>
        )}
      </nav>
    </header>
  )
}
