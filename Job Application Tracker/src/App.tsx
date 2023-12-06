import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserAuthenticated } from './redux/actions/authActions';
import AuthView from './Auth/Auth'
import './App.css'
import DataManager from './DataManager/DataManager';
import Toaster from './Components/Toaster';
import Loader from './Components/Loader';
import Logout from './Auth/Logout';

interface AuthState {
  isAuthenticated: boolean;
}

interface AppState {
  auth: AuthState;
  loading: boolean;
}

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
    <>
      {isLoading && <Loader />}
      {isAuthenticated ? (
        <>
          <DataManager />
          <Logout />
        </>
      ) : (
        <AuthView />
      )}

      <Toaster />
    </>
  )
}

export default App;