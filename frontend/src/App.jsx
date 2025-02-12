
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Login from './pages/Login';
import Register from './pages/Register';
import Guest from './pages/Guest';
import Home from './pages/Home';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import InitializeAuth from './components/InitializeAuth';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <Router>
          <InitializeAuth />
          <Toast />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/guest" element={<Guest />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </RecoilRoot>
  )
}

export default App
