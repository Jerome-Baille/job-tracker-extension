import { formatDateForDisplay, formatDateForISO } from '../utils/FormatDate';
import { TableProps } from '../interfaces'
import { DateTime } from 'luxon';

export const DataTable = ({ data, setData }: TableProps) => {
    const handleBlur = (event: React.FocusEvent<HTMLTableCellElement>, field: keyof typeof data) => {
        const value = event.target.textContent || '';
        if (field === 'applicationDate') {
            const isoDate = formatDateForISO(value);
            if (!isoDate) return;
            
            const dateTime = DateTime.fromISO(isoDate);
            setData({ 
                ...data, 
                applicationDate: isoDate,
                applicationYear: dateTime.year
            });
            return;
        }
        setData({ ...data, [field]: value });
    };

    return (
        <table>
            <tr>
                <th>Title</th>
                <td contentEditable onBlur={(event) => handleBlur(event, 'name')}>{data.name}</td>
            </tr>
            <tr>
                <th>Company</th>
                <td contentEditable onBlur={(event) => handleBlur(event, 'company')}>{data.company}</td>
            </tr>
            <tr>
                <th>Location</th>
                <td contentEditable onBlur={(event) => handleBlur(event, 'location')}>{data.location}</td>
            </tr>
            <tr>
                <th>Type</th>
                <td contentEditable onBlur={(event) => handleBlur(event, 'type')}>{data.type}</td>
            </tr>
            <tr>
                <th>Date</th>
                <td contentEditable onBlur={(event) => handleBlur(event, 'applicationDate')}>{data.applicationDate ? formatDateForDisplay(data.applicationDate) : null}</td>
            </tr>
            <tr>
                <th>Link</th>
                <td>
                    <a href={data.link} target="_blank" rel="noopener noreferrer">{data.link}</a>
                </td>
            </tr>
        </table>
    );
};