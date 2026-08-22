import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

export default function Admin() {
  const { user, token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') return
    api('/api/bookings', { token })
      .then(setBookings)
      .catch((err) => setMessage(err.message))
  }, [user, token])

  if (user?.role !== 'admin') {
    return (
      <section className="content">
        <p className="empty">You need an admin account to view this page.</p>
      </section>
    )
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this booking?')) return
    try {
      await api(`/api/bookings/${id}`, { method: 'DELETE', token })
      setBookings(bookings.filter((b) => b._id !== id))
      setMessage('Booking deleted')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <section className="content">
      <h2 className="section-title">All Bookings</h2>

      {message && <div className="alert alert-success">{message}</div>}

      {bookings.length === 0 ? (
        <p className="empty">No bookings found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.name}</td>
                <td>{b.email}</td>
                <td>{b.mobile}</td>
                <td>{b.room}</td>
                <td>{formatDate(b.checkin)}</td>
                <td>{formatDate(b.checkout)}</td>
                <td>{b.guests}</td>
                <td>₹{b.totalPrice}</td>
                <td>
                  <button className="btn-danger" onClick={() => remove(b._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
