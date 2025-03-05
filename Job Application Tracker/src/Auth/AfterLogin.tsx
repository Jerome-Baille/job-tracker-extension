import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';
import { setUserAuthenticated } from '../redux/actions/authActions';
import { showToast } from '../services/toastService';
import { showLoader, hideLoader } from '../redux/reducers/loadingSlice';
import { useNavigate } from 'react-router-dom';
import MfaVerification from './MfaVerification';

const AfterLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('Verifying authentication...');
    const [requireMfa, setRequireMfa] = useState(false);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    
    useEffect(() => {
        const verifyAuthentication = async () => {
            dispatch(showLoader());
            
            try {
                setVerificationStatus('Connecting to authentication service...');
                const response = await axios.get(`${API_ENDPOINTS.auth}/verif`);
                
                // Check if MFA is required
                if (response.data.status === 'success' && response.data.requireMFA) {
                    setVerificationStatus('MFA verification required');
                    setRequireMfa(true);
                    setUserId(response.data.userId);
                    setUsername(response.data.username);
                    dispatch(hideLoader());
                    return;
                }
                
                if (response.data.status === 'success' && response.data.mfaVerified) {
                    setVerificationStatus('Authentication successful!');
                    dispatch(setUserAuthenticated(true));
                    
                    showToast({
                        type: 'success',
                        message: 'Successfully authenticated!'
                    });
                    
                    // Redirect to data manager after successful verification
                    navigate('/data-manager');
                } else {
                    setVerificationStatus('Authentication failed');
                    throw new Error('Authentication verification failed');
                }
            } catch (error) {
                console.error('Authentication verification error:', error);
                setVerificationStatus('Authentication failed');
                dispatch(setUserAuthenticated(false));
                
                showToast({
                    type: 'error',
                    message: 'Authentication verification failed. Please try again.'
                });
                
                // Redirect back to auth page on failure
                navigate('/');
            } finally {
                dispatch(hideLoader());
            }
        };
        
        verifyAuthentication();
    }, [dispatch, navigate]);
    
    const handleMfaCancel = () => {
        navigate('/');
    };
    
    if (requireMfa) {
        return <MfaVerification 
                  userId={userId} 
                  username={username} 
                  onCancel={handleMfaCancel} 
                />;
    }
    
    return (
        <div className="auth-container">
            <p>{verificationStatus}</p>
        </div>
    );
};

export default AfterLogin;