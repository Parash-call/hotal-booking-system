import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/Toasts";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import { SocketProvider } from "./context/SocketContext";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import Rooms from "./pages/Rooms";
import HotelDetails from "./pages/HotelDetails";
import RoomDetails from "./pages/RoomDetails";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/user/Dashboard";
import MyBookings from "./pages/user/MyBookings";
import Profile from "./pages/user/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageHotels from "./pages/admin/ManageHotels";
import ManageRooms from "./pages/admin/ManageRooms";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageReviews from "./pages/admin/ManageReviews";
import ManageDeals from "./pages/admin/ManageDeals";
import LiveChat from "./pages/admin/LiveChat";

const App = () => {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <BookingProvider>
            <SocketProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/hotels"
                      element={
                        <ProtectedRoute>
                          <Hotels />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/hotels/:id"
                      element={
                        <ProtectedRoute>
                          <HotelDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/rooms"
                      element={
                        <ProtectedRoute>
                          <Rooms />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/rooms/:id"
                      element={
                        <ProtectedRoute>
                          <RoomDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/booking"
                      element={
                        <ProtectedRoute>
                          <Booking />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/booking-success"
                      element={
                        <ProtectedRoute>
                          <BookingSuccess />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-bookings"
                      element={
                        <ProtectedRoute>
                          <MyBookings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  <Route path="/admin" element={<AdminLayout />}>
                    <Route
                      index
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="hotels"
                      element={
                        <ProtectedRoute adminOnly>
                          <ManageHotels />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="rooms"
                      element={
                        <ProtectedRoute adminOnly>
                          <ManageRooms />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="bookings"
                      element={
                        <ProtectedRoute adminOnly>
                          <ManageBookings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute adminOnly>
                          <ManageUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="reviews"
                      element={
                        <ProtectedRoute adminOnly>
                          <ManageReviews />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="deals"
                      element={
                        <ProtectedRoute adminOnly>
                          <ManageDeals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="chat"
                      element={
                        <ProtectedRoute adminOnly>
                          <LiveChat />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Routes>
              </BrowserRouter>
            </SocketProvider>
          </BookingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
};

export default App;
