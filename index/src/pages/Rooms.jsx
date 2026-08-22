import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const FALLBACK_ROOMS = [
  {
    type: 'Deluxe Room',
    price: 2500,
    features: ['King Size Bed', 'Free Wi-Fi', 'Air Conditioner']
  },
  {
    type: 'Suite Room',
    price: 4500,
    features: ['Luxury Bed', 'Smart TV', 'Free Breakfast']
  },
  {
    type: 'Family Room',
    price: 6000,
    features: ['Two Double Beds', 'Free Wi-Fi', 'Balcony View']
  }
]

export default function Rooms() {
  const [rooms, setRooms] = useState(FALLBACK_ROOMS)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/rooms')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRooms(data)
      })
      .catch(() => setError('Server offline — showing default rooms'))
  }, [])

  return (
    <section className="rooms">
      <h2 className="section-title">Our Luxury Rooms</h2>

      {error && <p className="alert alert-warn">{error}</p>}

      <div className="rooms-grid">
        {rooms.map((room) => (
          <div className="room-card" key={room.type}>
            <img src="/images/hotel.jpg" alt={room.type} />
            <h3>{room.type}</h3>
            {room.features?.map((f) => <p key={f}>✔ {f}</p>)}
            <p><strong>Price: ₹{room.price} / Night</strong></p>
            <Link to={`/booking?room=${encodeURIComponent(room.type)}`} className="btn">Book Now</Link>
          </div>
        ))}
      </div>
    </section>
  )
}
