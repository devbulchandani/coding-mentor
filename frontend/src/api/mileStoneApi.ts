import axiosClient from './axiosClient';
import { MilestoneNotes } from '../types';

export const milestoneApi = {
    getNotes: async (milestoneId: string | number): Promise<MilestoneNotes> => {
        const response = await axiosClient.get<MilestoneNotes>(`/milestones/${milestoneId}/notes`);
        return response.data;
    },

    generateNotes: async (milestoneId: string | number): Promise<void> => {
        const response = await axiosClient.post<void>(`/milestones/${milestoneId}/notes/generate`);
        return response.data;
    }
};
