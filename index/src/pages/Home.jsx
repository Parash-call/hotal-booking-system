import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <section className="hero">
        <img src="/images/hotel.jpg" alt="Hotel" />
        <div className="hero-text">
          <h2>Luxury Hotel Booking</h2>
          <p>
            Book luxury rooms at affordable prices.
            Enjoy comfortable rooms, delicious food,
            free Wi-Fi and 24×7 service.
          </p>
          <Link to="/booking" className="btn">Book Now</Link>
        </div>
      </section>

      <section className="features">
        <div className="card">
          <h3>Luxury Rooms</h3>
          <p>Modern and comfortable rooms.</p>
        </div>
        <div className="card">
          <h3>Free Wi-Fi</h3>
          <p>High-speed internet in every room.</p>
        </div>
        <div className="card">
          <h3>Restaurant</h3>
          <p>Fresh and delicious food available.</p>
        </div>
      </section>
    </>
  )
}
