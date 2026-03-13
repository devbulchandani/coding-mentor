import axiosClient from './axiosClient';
import { AuthResponse } from '../types';

export const authApi = {
    register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/register', {
            name,
            email,
            password
        });
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await axiosClient.post<AuthResponse>('/auth/login', {
            email,
            password
        });
        return response.data;
    }
};
