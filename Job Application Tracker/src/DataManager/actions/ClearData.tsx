import { showToast } from '../../services/toastService';
import { JobDataProps } from '../../interfaces';

export const ClearData = ({ setData }: JobDataProps) => {

    const handleClear = async () => {
        try {
            setData({
                name: '',
                company: '',
                location: '',
                type: '',
                link: '',
                applicationDate: '',
                applicationYear: 0,
            });
        } catch (error) {
            showToast({
                type: 'error',
                message: "Error clearing data",
            });
        }
    }

    return (
        <button
            onClick={handleClear}
        >
            Clear
        </button>
    )
};