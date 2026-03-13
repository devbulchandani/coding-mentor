import axiosClient from './axiosClient';
import { LearningPlan } from '../types';

export const planApi = {
    createPlan: async (technology: string, duration: number, skillLevel: string): Promise<LearningPlan> => {
        const response = await axiosClient.post<LearningPlan>('/plans', {
            technology,
            duration,
            skillLevel
        });
        return response.data;
    },

    getMyPlans: async (): Promise<LearningPlan[]> => {
        const response = await axiosClient.get<LearningPlan[]>("/plans/my-plans");
        return response.data;
    },

    updateGitubUrl: async (planId: string, githubUrl: string): Promise<void> => {
        const response = await axiosClient.put<void>(`/plans/${planId}/github`, null, {
            params: { githubUrl }
        });
        return response.data;
    }
};
