import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import ClassesPage from './pages/ClassesPage';
import AddStudentsPage from './pages/AddStudentsPage';
import GenerateQRPage from './pages/GenerateQRPage';
import LiveSession from './pages/LiveSession';  // ✅ Added import

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />

            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/classes" element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            } />

            <Route path="/students" element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            } />

            <Route path="/add-students" element={
              <ProtectedRoute>
                <AddStudentsPage />
              </ProtectedRoute>
            } />

            <Route path="/generate-qr" element={
              <ProtectedRoute>
                <GenerateQRPage />
              </ProtectedRoute>
            } />

            {/* ✅ NEW ROUTE ADDED FOR TEACHER LIVE QR PAGE */}
            <Route path="/teacher/live/:classId" element={
              <ProtectedRoute>
                <LiveSession />
              </ProtectedRoute>
            } />
          </Routes>

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
