import { fetchData } from '../../utils/FetchData';
import { showToast } from '../../services/toastService';
import { JobDataProps } from '../../interfaces';

export const DisplayData = ({ setData, isEmpty }: JobDataProps) => {

    const handleClick = async () => {
        if(!isEmpty) {
            console.log("Data already fetched");
            return;
        }

        try {
            const dataFetched = await fetchData();

            if (dataFetched) {
                setData(dataFetched);
            }
        } catch (error) {
            showToast({
                type: 'error',
                message: "Error fetching data",
            });
        }
    }

    return (
        <button
            onClick={handleClick}
        >
            Display
        </button>
    )
}
