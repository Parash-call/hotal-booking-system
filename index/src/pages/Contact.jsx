import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <section className="content auth">
      <h2 className="section-title">Contact Us</h2>

      <div className="contact-info">
        <p>📍 Hotel Street, New Delhi, India</p>
        <p>📞 +91 98765 43210</p>
        <p>✉️ info@hotelbookingsystem.com</p>
      </div>

      {sent && <div className="alert alert-success">✅ Message sent! We will get back to you soon.</div>}

      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="name">Your Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Your Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows="5"
          placeholder="Write your message"
          value={form.message}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn">Send Message</button>
      </form>
    </section>
  )
}
