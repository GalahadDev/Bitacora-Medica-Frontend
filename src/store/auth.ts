import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProfile } from '@/types';

interface AuthState {
    token: string | null;
    user: User | null;
    profile: UserProfile | null;
    isAuthenticated: boolean;

    setAuth: (token: string, user: User, profile: UserProfile) => void;
    updateProfile: (data: Partial<UserProfile>) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            profile: null,
            isAuthenticated: false,

            setAuth: (token, user, profile) =>
                set({ token, user, profile, isAuthenticated: true }),

            updateProfile: (data) =>
                set((state) => ({
                    profile: state.profile ? { ...state.profile, ...data } : null
                })),

            logout: () => {
                set({ token: null, user: null, profile: null, isAuthenticated: false });
            },
        }),
        {
            name: 'bitacora-auth-storage',
        }
    )
);