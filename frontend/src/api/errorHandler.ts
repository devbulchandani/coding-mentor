import { ApiError } from '../types';

/**
 * Extract user-friendly error message from API error response
 */
export const getErrorMessage = (error: ApiError): string => {
    if (error.response) {
        // Server responded with error status
        return error.response.data?.message || 
               error.response.data?.error || 
               `Error: ${error.response.status}`;
    } else if (error.request) {
        // Request made but no response
        return 'Unable to connect to server. Please check your connection.';
    } else {
        // Something else happened
        return error.message || 'An unexpected error occurred';
    }
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: ApiError): boolean => {
    return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Check if error is network related
 */
export const isNetworkError = (error: ApiError): boolean => {
    return !error.response && !!error.request;
};
