import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SearchProvider } from './context/SearchContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Landing from './pages/Landing'

import RequesterDashboard from './pages/requester/Dashboard'
import NewRequest from './pages/requester/NewRequest'
import ChangeDetail from './pages/requester/ChangeDetail'

import ApproverDashboard from './pages/approver/Dashboard'
import ReviewChange from './pages/approver/ReviewChange'

import ImplementerDashboard from './pages/implementer/Dashboard'
import ManageChange from './pages/implementer/ManageChange'

import AdminDashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import AdminChangeDetail from './pages/admin/ChangeDetail'

const wrap = (roles, children) => (
  <PrivateRoute roles={roles}>
    <Layout>{children}</Layout>
  </PrivateRoute>
)

export default function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<div className="p-8 text-red-500 text-sm">Accès non autorisé.</div>} />

            {/* Requester */}
            <Route path="/requester" element={wrap(['requester'], <RequesterDashboard />)} />
            <Route path="/requester/changes" element={wrap(['requester'], <RequesterDashboard />)} />
            <Route path="/requester/new" element={wrap(['requester'], <NewRequest />)} />
            <Route path="/requester/changes/:id" element={wrap(['requester'], <ChangeDetail />)} />
            <Route path="/requester/changes/:id/edit" element={wrap(['requester'], <NewRequest />)} />

            {/* Approver */}
            <Route path="/approver" element={wrap(['approver'], <ApproverDashboard />)} />
            <Route path="/approver/changes" element={wrap(['approver'], <ApproverDashboard />)} />
            <Route path="/approver/changes/:id" element={wrap(['approver'], <ReviewChange />)} />

            {/* Implementer */}
            <Route path="/implementer" element={wrap(['implementer'], <ImplementerDashboard />)} />
            <Route path="/implementer/changes" element={wrap(['implementer'], <ImplementerDashboard />)} />
            <Route path="/implementer/changes/:id" element={wrap(['implementer'], <ManageChange />)} />

            {/* Admin */}
            <Route path="/admin" element={wrap(['admin'], <AdminDashboard />)} />
            <Route path="/admin/changes" element={wrap(['admin'], <AdminDashboard />)} />
            <Route path="/admin/changes/:id" element={wrap(['admin'], <AdminChangeDetail />)} />
            <Route path="/admin/users" element={wrap(['admin'], <Users />)} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </AuthProvider>
  )
}