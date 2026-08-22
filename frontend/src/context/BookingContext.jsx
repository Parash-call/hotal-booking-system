import { createContext, useContext, useState } from "react";

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [booking, setBooking] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);

  const startBooking = (data) => setBooking(data);
  const clearBooking = () => setBooking(null);
  const completePayment = (payment) => setLastPayment(payment);
  const clearPayment = () => setLastPayment(null);

  return (
    <BookingContext.Provider
      value={{ booking, lastPayment, startBooking, clearBooking, completePayment, clearPayment }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
