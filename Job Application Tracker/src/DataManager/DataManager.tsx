import { useState, useEffect } from 'react';
import { DisplayData } from './actions/DisplayData';
import { ClearData } from './actions/ClearData';
import { ExportData } from './actions/ExportData';
import { DataTable } from './DataTable';
import { JobData } from '../interfaces';
import { fetchData } from '../utils/FetchData';
import { showToast } from '../services/toastService';

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

    const reloadData = async () => {
        try {
            const dataFetched = await fetchData();
            setData(dataFetched);
        } catch (error) {
            showToast({
                type: 'error',
                message: "Error fetching data",
            });
        }
    };

    useEffect(() => {
        // Establish connection with background script
        const port = chrome.runtime.connect({ name: "popup" });
        
        port.onMessage.addListener((message) => {
            if (message.type === 'TAB_CHANGED') {
                reloadData();
            } else if (message.type === 'TAB_UNSUPPORTED') {
                showToast({
                    type: 'info',
                    message: "This website is not supported by the extension",
                });
            }
        });
    
        // Cleanup connection on unmount
        return () => {
            port.disconnect();
        };
    }, []);

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
    );
}

export default DataManager;