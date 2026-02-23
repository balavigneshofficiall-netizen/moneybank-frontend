
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Auth Pages
import Login from './components/login/Login'
import Otp from './components/login/Otp';
import Register from './components/register/Register';

// Layout
import Layout from './components/layout/Layout';

// Protected Pages
import Dashboard from './components/dashboard/Dashboard';
import Transactions from './components/transactions/Transactions';
import AddTransaction from './components/transactions/AddTransaction';
import EditTransaction from './components/transactions/EditTransaction';
import Categories from './components/categories/Categories';
import Profile from './components/profile/Profile';

// Auth Store
import useAuthStore from './store/authStore';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Login />} />
          <Route path='/otp' element={<Otp />} />
          <Route path='/register' element={<Register />} />

          {/* Protected Routes with Layout */}
          <Route path='/' element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='transactions' element={<Transactions />} />
            <Route path='add-transaction' element={<AddTransaction />} />
            <Route path='edit-transaction/:id' element={<EditTransaction />} />
            <Route path='categories' element={<Categories />} />
            <Route path='profile' element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
