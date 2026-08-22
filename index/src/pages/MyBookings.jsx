import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

export default function MyBookings() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    api('/api/bookings/my', { token })
      .then(setBookings)
      .catch((err) => setMessage(err.message))
  }, [token])

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await api(`/api/bookings/${id}`, { method: 'DELETE', token })
      setBookings(bookings.filter((b) => b._id !== id))
      setMessage('Booking cancelled')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <section className="content">
      <h2 className="section-title">My Bookings</h2>

      {message && <div className="alert alert-success">{message}</div>}

      {bookings.length === 0 ? (
        <p className="empty">No bookings yet. <a href="/booking">Book a room</a>.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.room}</td>
                <td>{formatDate(b.checkin)}</td>
                <td>{formatDate(b.checkout)}</td>
                <td>{b.guests}</td>
                <td>₹{b.totalPrice}</td>
                <td>{b.status}</td>
                <td>
                  <button className="btn-danger" onClick={() => cancel(b._id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
