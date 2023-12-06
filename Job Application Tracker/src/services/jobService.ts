import http from './httpService';
import { API_ENDPOINTS  } from "../config/apiConfig";
import { JobData } from "../interfaces";

// export async function getAllOpportunities(token) {
//     const response = await fetch(API_BASE_URL,{
//         method: 'GET',
//         withCredentials: true,
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//     })
//     .then((response) => response.json().then(data => ({status: response.status, body: data})))
//     return response;
// }

// export async function getOneOpportunity(token, id) {
//     const response = await fetch(`${API_BASE_URL}/job/${id}`,{
//         method: 'GET',
//         withCredentials: true,
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//     })
//     .then((response) => response.json().then(data => ({status: response.status, body: data})))
//     return response;
// }

export const postOpportunity = async (opportunity: JobData) => {
    try {
        const response = await http.post(`${API_ENDPOINTS.job}`, opportunity);

        return response.data;
    } catch (error) {
        throw error;
    }
}

// export async function putOpportunity(token, opportunity) {
//     const response = await fetch(`${API_BASE_URL}/job/${opportunity._id}`, {
//         method: 'PUT',
//         withCredentials: true,
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             ...opportunity
//         })
//     })
//     .then((response) => response.json().then(data => ({status: response.status, body: data})))
//     return response;
// }

// export async function deleteOpportunity(token, id) {
//     const response = await fetch(`${API_BASE_URL}/job/${id}`, {
//         method: 'DELETE',
//         withCredentials: true,
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         }
//     })
//     .then((response) => response.json().then(data => ({status: response.status, body: data})))
//     return response;
// }