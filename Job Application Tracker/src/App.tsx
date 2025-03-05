import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserAuthenticated } from './redux/actions/authActions';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthView from './Auth/Auth';
import './App.css';
import DataManager from './DataManager/DataManager';
import Toaster from './Components/Toaster';
import Loader from './Components/Loader';
import Logout from './Auth/Logout';
import AfterLogin from './Auth/AfterLogin';
import AfterRegister from './Auth/AfterRegister';

interface AuthState {
  isAuthenticated: boolean;
}

interface AppState {
  auth: AuthState;
  loading: boolean;
}

// A protected route component to redirect if not authenticated
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: AppState) => state.auth);
  
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: AppState) => state.auth);
  const isLoading = useSelector((state: AppState) => state.loading);

  useEffect(() => {
    chrome.storage.sync.get(['JT_accessToken'], function (result) {
      if (result.JT_accessToken) {
        dispatch(setUserAuthenticated(true));
      }
    });
  }, [dispatch]);

  return (
    <Router>
      {isLoading && <Loader />}
      
      {/* Show logout button if authenticated */}
      {isAuthenticated && <Logout />}
      
      <Routes>
        {/* Main route - shows auth or redirects to data manager */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/data-manager" replace /> : <AuthView />} 
        />
        
        {/* Protected data manager route */}
        <Route 
          path="/data-manager" 
          element={<ProtectedRoute element={<DataManager />} />} 
        />
        
        {/* Auth callback routes */}
        <Route path="/auth/after-login" element={<AfterLogin />} />
        <Route path="/auth/after-register" element={<AfterRegister />} />
      </Routes>

      <Toaster />
    </Router>
  );
}

export default App;