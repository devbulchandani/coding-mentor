import axiosClient from './axiosClient';
import { VerificationResult } from '../types';

export const verificationApi = {
    verifyMilestone: async (milestoneId: string | number, files?: Record<string, string>): Promise<VerificationResult> => {
        const response = await axiosClient.post<VerificationResult>(`/verify/${milestoneId}`, files ? { files } : undefined);
        return response.data;
    }
};
