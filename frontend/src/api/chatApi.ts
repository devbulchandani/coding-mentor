import axiosClient from './axiosClient';

export const chatApi = {
    sendMessage: async (learningPlanId: string, message: string, repoUrl?: string): Promise<string> => {
        const response = await axiosClient.post<string>('/chat', {
            learningPlanId,
            message,
            repoUrl
        });
        return response.data;
    }
};
