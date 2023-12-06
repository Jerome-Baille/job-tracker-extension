import { useState } from 'react';
import { DisplayData } from './actions/DisplayData';
import { ClearData } from './actions/ClearData';
import { ExportData } from './actions/ExportData';
import { DataTable } from './DataTable';
import { JobData } from '../interfaces'

function DataManager() {
    const [data, setData] = useState<JobData>({
        name: '',
        company: '',
        location: '',
        type: '',
        link: '',
        applicationDate: '',
        applicationYear: 0,
    });

    const isEmpty = Object.values(data).every(val => val === '' || val === 0);

    return (
        <main className='main-container'>
            <div className="btn-container">
                <DisplayData
                    setData={setData}
                    isEmpty={isEmpty}
                />
                <ClearData setData={setData} />
                <ExportData
                    data={data}
                    setData={setData}
                    isEmpty={isEmpty}
                />
            </div>
            <div id="content">
                {!isEmpty ? (
                    <DataTable
                        data={data}
                        setData={setData}
                    />
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </main>
    )
}

export default DataManager;