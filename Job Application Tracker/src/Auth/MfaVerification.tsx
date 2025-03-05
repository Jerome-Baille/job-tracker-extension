import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { completeMfaLogin } from '../services/authService';
import { showToast } from '../services/toastService';
import { setUserAuthenticated } from '../redux/actions/authActions';
import { showLoader, hideLoader } from '../redux/reducers/loadingSlice';
import './AuthStyle.css';

interface MfaVerificationProps {
  userId: string;
  username: string;
  onCancel: () => void;
}

const MfaVerification = ({ userId, username, onCancel }: MfaVerificationProps) => {
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrorMessage('Please enter your verification code');
      return;
    }

    dispatch(showLoader());

    try {
      const response = await completeMfaLogin(userId, token);
      
      if (response.status === 'success') {
        dispatch(setUserAuthenticated(true));
        showToast({
          type: 'success',
          message: `Welcome back, ${username}!`
        });
      } else {
        throw new Error('MFA verification failed');
      }
    } catch (error: any) {
      console.error('MFA verification error:', error);
      dispatch(setUserAuthenticated(false));
      
      setErrorMessage(error.response?.data?.message || 'MFA verification failed');
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'MFA verification failed'
      });
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-container">
      <h3>Two-Factor Authentication</h3>
      <p>Hi {username}, please enter your verification code:</p>
      
      <input
        type="text"
        placeholder="Enter verification code"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        autoFocus
      />
      
      {errorMessage && <p className="error-text">{errorMessage}</p>}
      
      <div className="button-group">
        <button type="submit">Verify</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default MfaVerification;