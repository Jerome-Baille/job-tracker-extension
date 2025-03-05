import { fetchData } from '../../utils/FetchData';
import { showToast } from '../../services/toastService';
import { postOpportunity } from '../../services/jobService';
import { JobDataProps } from '../../interfaces';

export const ExportData = ({ data, setData, isEmpty }: JobDataProps) => {

    const handleExport = async () => {
        try {
            if (isEmpty) {
                const dataFetched = await fetchData();
                setData(dataFetched);
                if (dataFetched) {
                    await postOpportunity(dataFetched);
                }
            } else if (data) {
                await postOpportunity(data);
            }
            showToast({
                type: 'success',
                message: 'Data exported successfully'
            });
        } catch (error: any) {
            showToast({
                type: 'error',
                message: error.response.data.message || 'Error exporting data'
            });
        }
    }

    return (
        <button
            onClick={handleExport}
        >
            Export
        </button>
    )
};