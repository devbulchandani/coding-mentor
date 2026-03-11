import { create } from 'zustand';
import { persist } from "zustand/middleware";
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/errorHandler';

const useAppStore = create(
    persist(
        (set) => ({
            user: null,
            currentPlan: null,
            milestones: [],
            notifications: [],
            repoUrl: '',

            // ---- AUTH ----
            login: async (email, password) => {
                try {
                    const response = await authApi.login(email, password);
                    localStorage.setItem('authToken', response.token);

                    set({
                        user: {
                            id: response.userId,
                            email: response.email,
                            name: response.name,
                        },
                    });

                    return { success: true };
                } catch (error) {
                    console.error('Login failed:', error);
                    return { success: false, error: getErrorMessage(error) };
                }
            },

            register: async (name, email, password) => {
                try {
                    const response = await authApi.register(name, email, password);
                    localStorage.setItem('authToken', response.token);

                    set({
                        user: {
                            id: response.userId,
                            email: response.email,
                            name: name,
                        },
                    });

                    return { success: true };
                } catch (error) {
                    console.error('Registration failed:', error);
                    return { success: false, error: getErrorMessage(error) };
                }
            },

            logout: () => {
                localStorage.removeItem('authToken');
                set({ user: null, currentPlan: null, milestones: [] });
            },

            // ---- STATE SETTERS ----
            setCurrentPlan: (plan) => set({ currentPlan: plan }),

            setRepoUrl: (url) => set({ repoUrl: url }),

            setMilestones: (milestones) => set({ milestones }),

            updateMilestoneStatus: (id, status) =>
                set((state) => ({
                    milestones: state.milestones.map((m) =>
                        m.id === id ? { ...m, completed: status } : m
                    ),
                })),
        }),

        {
            name: "app-storage", // key in localStorage
            partialize: (state) => ({
                user: state.user,
                currentPlan: state.currentPlan,
                repoUrl: state.repoUrl,
                milestones: state.milestones,
            }),
        }
    )
);

export default useAppStore;
