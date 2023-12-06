import { useDispatch } from 'react-redux';
import { setUserAuthenticated } from '../redux/actions/authActions';
import { logout } from '../services/authService';
import { showToast } from '../services/toastService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

const AuthLogout = () => {
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            dispatch(setUserAuthenticated(false));
            await logout();

            // Display success toast
            showToast({
                type: 'success',
                message: `Farewell my friend !`,
            });
        } catch (error: any) {
            console.error(error);
            dispatch(setUserAuthenticated(true));

            // Display error toast
            showToast({
                type: 'error',
                message: error.response.data.message,
            });
        }

    };

    return (
        <button onClick={() => handleLogout()} className='logout-button'>
            <FontAwesomeIcon icon={faPowerOff} size="lg" style={{ color: "#ae0437", }} />
        </button>
    );
};

export default AuthLogout;