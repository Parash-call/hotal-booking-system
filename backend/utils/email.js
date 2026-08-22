const nodemailer = require("nodemailer");

const MAIL_ENABLED =
  process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS;

let transporter = null;

if (MAIL_ENABLED) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
}

const sendMail = async ({ to, subject, html, text }) => {
  if (!MAIL_ENABLED) {
    console.log("=== [DEV MAIL] (no SMTP configured, email logged only) ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(html || text);
    console.log("========================================================");
    return { dev: true, message: "Email logged (no SMTP configured)" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Grand Hotel Booking"}" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
      text
    });
    console.log("Email sent:", info.messageId);
    return { messageId: info.messageId };
  } catch (err) {
    console.error("Email send failed:", err.message);
    throw err;
  }
};

const bookingConfirmationEmail = (booking) => {
  const checkin = new Date(booking.checkin).toDateString();
  const checkout = new Date(booking.checkout).toDateString();
  return {
    subject: `Booking Confirmed - ${booking.room} (Ref: ${booking.bookingRef})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#0f172a;color:#fff;padding:24px;text-align:center;">
          <h2 style="margin:0;">Grand Hotel Booking</h2>
          <p style="margin:6px 0 0;opacity:.85;">Booking Confirmation</p>
        </div>
        <div style="padding:24px;color:#334155;">
          <p>Hi <strong>${booking.name}</strong>, your booking is confirmed!</p>
          <table style="width:100%;border-collapse:collapse;margin-top:12px;">
            <tr><td style="padding:8px 0;color:#64748b;">Reference</td><td style="padding:8px 0;text-align:right;"><strong>${booking.bookingRef}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Room</td><td style="padding:8px 0;text-align:right;"><strong>${booking.room}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Check-in</td><td style="padding:8px 0;text-align:right;"><strong>${checkin}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Check-out</td><td style="padding:8px 0;text-align:right;"><strong>${checkout}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Guests</td><td style="padding:8px 0;text-align:right;"><strong>${booking.guests}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Total Paid</td><td style="padding:8px 0;text-align:right;"><strong>₹${booking.totalPrice}</strong></td></tr>
          </table>
          <p style="margin-top:16px;color:#64748b;font-size:13px;">
            This is an automated message from Grand Hotel. We look forward to hosting you!
          </p>
        </div>
      </div>`
  };
};

const paymentReceiptEmail = (payment, booking) => {
  return {
    subject: `Payment Receipt - ₹${payment.amount}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#059669;color:#fff;padding:24px;text-align:center;">
          <h2 style="margin:0;">Payment Received</h2>
        </div>
        <div style="padding:24px;color:#334155;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#64748b;">Receipt No.</td><td style="padding:8px 0;text-align:right;"><strong>${payment.transactionId}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Booking Ref.</td><td style="padding:8px 0;text-align:right;"><strong>${booking.bookingRef}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Method</td><td style="padding:8px 0;text-align:right;"><strong>${payment.method}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Status</td><td style="padding:8px 0;text-align:right;"><strong style="color:#059669;">${payment.status}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Amount</td><td style="padding:8px 0;text-align:right;"><strong>₹${payment.amount}</strong></td></tr>
          </table>
          <p style="margin-top:16px;color:#64748b;font-size:13px;">Thank you for choosing Grand Hotel!</p>
        </div>
      </div>`
  };
};

module.exports = { sendMail, bookingConfirmationEmail, paymentReceiptEmail };
