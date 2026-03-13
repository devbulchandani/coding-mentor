import axiosClient from './axiosClient';
import { VerificationResult } from '../types';

export const verificationApi = {
    verifyMilestone: async (milestoneId: string | number): Promise<VerificationResult> => {
        const response = await axiosClient.post<VerificationResult>(`/verify/${milestoneId}`);
        return response.data;
    }
};
