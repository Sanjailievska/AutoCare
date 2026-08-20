import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import { ProtectedRoute } from '@/router/ProtectedRoute'

import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'

import CustomerDashboard from '@/pages/customer/CustomerDashboard'
import Vehicles from '@/pages/customer/Vehicles'
import VehicleDetail from '@/pages/customer/VehicleDetail'
import RequestsList from '@/pages/customer/RequestsList'
import NewRequest from '@/pages/customer/NewRequest'
import RequestDetail from '@/pages/customer/RequestDetail'
import FindShop from '@/pages/customer/FindShop'
import ShopProfile from '@/pages/customer/ShopProfile'
import ServiceHistory from '@/pages/customer/ServiceHistory'
import NotificationsPage from '@/pages/customer/NotificationsPage'
import CustomerProfile from '@/pages/customer/CustomerProfile'

import ShopDashboard from '@/pages/shop/ShopDashboard'
import ShopRequestsList from '@/pages/shop/ShopRequestsList'
import ShopRequestDetail from '@/pages/shop/ShopRequestDetail'
import ActiveRepairs from '@/pages/shop/ActiveRepairs'
import Appointments from '@/pages/shop/Appointments'
import ShopCustomers from '@/pages/shop/ShopCustomers'
import ShopVehicles from '@/pages/shop/ShopVehicles'
import ShopServices from '@/pages/shop/ShopServices'
import ShopMechanics from '@/pages/shop/ShopMechanics'
import ShopReviews from '@/pages/shop/ShopReviews'
import ShopSettings from '@/pages/shop/ShopSettings'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminShops from '@/pages/admin/AdminShops'
import AdminRequests from '@/pages/admin/AdminRequests'
import AdminReviews from '@/pages/admin/AdminReviews'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Customer */}
        <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/vehicles" element={<ProtectedRoute roles={['customer']}><Vehicles /></ProtectedRoute>} />
        <Route path="/customer/vehicles/:id" element={<ProtectedRoute roles={['customer']}><VehicleDetail /></ProtectedRoute>} />
        <Route path="/customer/requests" element={<ProtectedRoute roles={['customer']}><RequestsList /></ProtectedRoute>} />
        <Route path="/customer/requests/new" element={<ProtectedRoute roles={['customer']}><NewRequest /></ProtectedRoute>} />
        <Route path="/customer/requests/:id" element={<ProtectedRoute roles={['customer']}><RequestDetail /></ProtectedRoute>} />
        <Route path="/customer/shops" element={<ProtectedRoute roles={['customer']}><FindShop /></ProtectedRoute>} />
        <Route path="/customer/shops/:id" element={<ProtectedRoute roles={['customer']}><ShopProfile /></ProtectedRoute>} />
        <Route path="/customer/history" element={<ProtectedRoute roles={['customer']}><ServiceHistory /></ProtectedRoute>} />
        <Route path="/customer/notifications" element={<ProtectedRoute roles={['customer']}><NotificationsPage /></ProtectedRoute>} />
        <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><CustomerProfile /></ProtectedRoute>} />

        {/* Shop */}
        <Route path="/shop" element={<ProtectedRoute roles={['shop']}><ShopDashboard /></ProtectedRoute>} />
        <Route path="/shop/requests" element={<ProtectedRoute roles={['shop']}><ShopRequestsList /></ProtectedRoute>} />
        <Route path="/shop/requests/:id" element={<ProtectedRoute roles={['shop']}><ShopRequestDetail /></ProtectedRoute>} />
        <Route path="/shop/repairs" element={<ProtectedRoute roles={['shop']}><ActiveRepairs /></ProtectedRoute>} />
        <Route path="/shop/appointments" element={<ProtectedRoute roles={['shop']}><Appointments /></ProtectedRoute>} />
        <Route path="/shop/customers" element={<ProtectedRoute roles={['shop']}><ShopCustomers /></ProtectedRoute>} />
        <Route path="/shop/vehicles" element={<ProtectedRoute roles={['shop']}><ShopVehicles /></ProtectedRoute>} />
        <Route path="/shop/services" element={<ProtectedRoute roles={['shop']}><ShopServices /></ProtectedRoute>} />
        <Route path="/shop/mechanics" element={<ProtectedRoute roles={['shop']}><ShopMechanics /></ProtectedRoute>} />
        <Route path="/shop/reviews" element={<ProtectedRoute roles={['shop']}><ShopReviews /></ProtectedRoute>} />
        <Route path="/shop/settings" element={<ProtectedRoute roles={['shop']}><ShopSettings /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/shops" element={<ProtectedRoute roles={['admin']}><AdminShops /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute roles={['admin']}><AdminRequests /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>} />

        <Route path="*" element={<Landing />} />
      </Routes>
    </ToastProvider>
  )
}
