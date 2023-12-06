import { toast } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'default';

interface ToastOptions {
    type?: ToastType;
    message: string;
}

export const showToast = ({ type = 'default', message }: ToastOptions): void => {
    switch (type) {
        case 'success':
            toast.success(message);
            break;
        case 'error':
            toast.error(message);
            break;
        case 'info':
            toast.info(message);
            break;
        default:
            toast(message);
    }
};