/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('authToken');
};

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
    localStorage.removeItem('authToken');
};
