import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyAuthentication } from '../services/authService';
import { showToast } from '../services/toastService';
import { showLoader, hideLoader } from '../redux/reducers/loadingSlice';

const AfterRegister = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('Verifying registration...');

    useEffect(() => {
        const verifyRegistration = async () => {
            dispatch(showLoader());
            
            try {
                const response = await verifyAuthentication();
                
                if (response.status === 'success') {
                    setVerificationStatus('Registration successful!');
                    showToast({
                        type: 'success',
                        message: 'Registration successful! Please log in to continue.'
                    });
                    navigate('/');
                } else {
                    throw new Error('Registration verification failed');
                }
            } catch (error) {
                console.error('Registration verification error:', error);
                setVerificationStatus('Registration verification failed');
                
                showToast({
                    type: 'error',
                    message: 'Registration verification failed. Please try again.'
                });
                navigate('/');
            } finally {
                dispatch(hideLoader());
            }
        };
        
        verifyRegistration();
    }, [dispatch, navigate]);
    
    return (
        <div className="auth-container">
            <p>{verificationStatus}</p>
        </div>
    );
};

export default AfterRegister;