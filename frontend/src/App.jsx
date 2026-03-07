import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./Layouts/MainLayout";
import AuthLayout from "./Layouts/AuthLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import MyRegistrations from "./pages/MyRegistrations";
import AdminSignup from "./pages/AdminSignup";

import ManageEvents from "./pages/admin/ManageEvents";
import CreateEvent from "./pages/admin/CreateEvents";
import EditEvent from "./pages/EditEvent";
import ViewEventStats from "./pages/admin/ViewEventStats";
import AdminScan from "./pages/admin/AdminScan";

import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import VerifyAdmins from "./pages/superadmin/VerifyAdmins";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <BrowserRouter>
      <>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />

          <Route
            path="/signup"
            element={
              <AuthLayout>
                <Signup />
              </AuthLayout>
            }
          />

          <Route
            path="/admin/signup"
            element={
              <AuthLayout>
                <AdminSignup />
              </AuthLayout>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Events />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EventDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MyRegistrations />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-events"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout>
                  <ManageEvents />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/manage-events/create"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout>
                  <CreateEvent />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/edit/:id"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout>
                  <EditEvent />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events/:eventId/stats"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout>
                  <ViewEventStats />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/scan"
            element={
              <ProtectedRoute adminOnly>
                <MainLayout>
                  <AdminScan />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin/dashboard"
            element={
              user?.role === "superadmin" ? (
                <SuperAdminDashboard />
              ) : (
                <Navigate to="/unauthorized" />
              )
            }
          />
          
<Route
  path="/superadmin/verify-admins"
  element={
    user?.role === "superadmin" ? (
      <VerifyAdmins />
    ) : (
      <Navigate to="/unauthorized" />
    )
  }
/>

          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen bg-black flex items-center justify-center">
                <h1 className="text-red-500 text-2xl font-bold">
                  Unauthorized Access
                </h1>
              </div>
            }
          />


        </Routes>
      </>
    </BrowserRouter>
  );
}
