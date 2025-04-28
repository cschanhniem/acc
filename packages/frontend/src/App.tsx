import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Callback from "./pages/auth/Callback";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";


// Pages
const Home = () => (
  <div className="container py-8">
    <h1 className="text-4xl font-bold mb-4">Welcome to AI Contract Check</h1>
    <p className="text-text-secondary">
      Your journey to digital wellness starts here.
    </p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <ProtectedRoute requireAuth={false}>
              <Callback />
            </ProtectedRoute>
          }
        />
        {/* Public routes with layout */}
        <Route element={<Layout />}>
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
        </Route>

        {/* Protected routes with layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
         
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
