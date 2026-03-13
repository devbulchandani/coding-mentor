import { create } from 'zustand';
import { persist } from "zustand/middleware";
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/errorHandler';
import { AppState, LearningPlan, Milestone } from '../types';

const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            currentPlan: null,
            milestones: [],
            notifications: [],
            repoUrl: '',

            // ---- AUTH ----
            login: async (email: string, password: string) => {
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
                    return { success: false, error: getErrorMessage(error as any) };
                }
            },

            register: async (name: string, email: string, password: string) => {
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
                    return { success: false, error: getErrorMessage(error as any) };
                }
            },

            logout: () => {
                localStorage.removeItem('authToken');
                set({ user: null, currentPlan: null, milestones: [] });
            },

            // ---- STATE SETTERS ----
            setCurrentPlan: (plan: LearningPlan | null) => set({ currentPlan: plan }),

            setRepoUrl: (url: string) => set({ repoUrl: url }),

            setMilestones: (milestones: Milestone[]) => set({ milestones }),

            updateMilestoneStatus: (id: number, status: boolean) =>
                set((state) => ({
                    milestones: state.milestones.map((m) =>
                        m.id === id ? { ...m, completed: status } : m
                    ),
                })),

            voicePlanId: undefined,
            voiceMilestoneId: undefined,
            setVoiceContext: (planId, milestoneId) => set({
                voicePlanId: planId,
                voiceMilestoneId: milestoneId
            }),
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
