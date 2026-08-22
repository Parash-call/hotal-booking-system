import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const ROOM_PRICES = {
  'Deluxe Room': 2500,
  'Suite Room': 4500,
  'Family Room': 6000
}

const emptyForm = {
  fullname: '',
  email: '',
  mobile: '',
  checkin: '',
  checkout: '',
  room: '',
  guests: ''
}

export default function Booking() {
  const { user, token } = useAuth()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullname: user?.name || prev.fullname,
      email: user?.email || prev.email
    }))
  }, [user])

  useEffect(() => {
    const room = searchParams.get('room')
    if (room) setForm((prev) => ({ ...prev, room }))
  }, [searchParams])

  const nights = useMemo(() => {
    if (!form.checkin || !form.checkout) return 0
    const start = new Date(form.checkin)
    const end = new Date(form.checkout)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [form.checkin, form.checkout])

  const totalPrice = nights * (ROOM_PRICES[form.room] || 0)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)

    try {
      const data = {
        name: form.fullname,
        email: form.email,
        mobile: form.mobile,
        checkin: form.checkin,
        checkout: form.checkout,
        room: form.room,
        guests: form.guests
      }
      const result = await api('/api/bookings/book', {
        method: 'POST',
        body: data,
        token
      })
      setMessage({ type: 'success', text: `✅ ${result.message}` })
      setForm(emptyForm)
      if (user) setForm((prev) => ({ ...prev, fullname: user.name, email: user.email }))
    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="booking">
      <h2 className="section-title">Book Your Room</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="fullname">Full Name</label>
        <input
          type="text"
          id="fullname"
          name="fullname"
          placeholder="Enter your full name"
          value={form.fullname}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="mobile">Mobile Number</label>
        <input
          type="tel"
          id="mobile"
          name="mobile"
          placeholder="Enter your mobile number"
          value={form.mobile}
          onChange={handleChange}
          required
        />

        <label htmlFor="checkin">Check-in Date</label>
        <input
          type="date"
          id="checkin"
          name="checkin"
          value={form.checkin}
          onChange={handleChange}
          required
        />

        <label htmlFor="checkout">Check-out Date</label>
        <input
          type="date"
          id="checkout"
          name="checkout"
          value={form.checkout}
          onChange={handleChange}
          required
        />

        <label htmlFor="room">Room Type</label>
        <select id="room" name="room" value={form.room} onChange={handleChange} required>
          <option value="">Select Room</option>
          {Object.keys(ROOM_PRICES).map((room) => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>

        <label htmlFor="guests">Number of Guests</label>
        <input
          type="number"
          id="guests"
          name="guests"
          min="1"
          max="10"
          value={form.guests}
          onChange={handleChange}
          required
        />

        {nights > 0 && form.room && (
          <p className="price-note">
            {nights} night{nights > 1 ? 's' : ''} × ₹{ROOM_PRICES[form.room]} ={' '}
            <strong>₹{totalPrice}</strong>
          </p>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Booking...' : 'Book Now'}
        </button>
      </form>
    </section>
  )
}
