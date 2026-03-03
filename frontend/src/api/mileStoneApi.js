import axiosClient from './axiosClient';

export const milestoneApi = {
    getNotes: async (milestoneId) => {
        const response = await axiosClient.get(`/milestones/${milestoneId}/notes`);
        return response.data;
    },

    generateNotes : async (milestoneId) => {
        const response = await axiosClient.post(`/milestones/${milestoneId}/notes/generate`);
        return response.data;
    }
};