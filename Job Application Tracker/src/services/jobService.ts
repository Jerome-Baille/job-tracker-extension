import http from './httpService';
import { API_ENDPOINTS  } from "../config/apiConfig";
import { JobData } from "../interfaces";

export const postOpportunity = async (opportunity: JobData) => {
    try {
        const response = await http.post(`${API_ENDPOINTS.job}`, opportunity);

        return response.data;
    } catch (error) {
        throw error;
    }
}