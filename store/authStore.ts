import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    serverUrl: string | null;
    token: string | null; // API token (for HTTP requests)
    jwtToken: string | null; // JWT token (for WebSocket connections)
    user: any | null;
    setServerUrl: (url: string) => void;
    setToken: (token: string) => void;
    setJwtToken: (token: string) => void;
    setUser: (user: any) => void;
    logout: () => void;
}

// Custom storage adapter for SecureStore
const secureStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(name);
            }
            return await SecureStore.getItemAsync(name);
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(name, value);
            } else {
                await SecureStore.setItemAsync(name, value);
            }
        } catch (error) {
            console.error('Error setting item in storage:', error);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(name);
            } else {
                await SecureStore.deleteItemAsync(name);
            }
        } catch (error) {
            console.error('Error removing item from storage:', error);
        }
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            serverUrl: null,
            token: null,
            jwtToken: null,
            user: null,
            setServerUrl: (url) => set({ serverUrl: url }),
            setToken: (token) => set({ token }),
            setJwtToken: (jwtToken) => set({ jwtToken }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, jwtToken: null, user: null }), // Keep serverUrl for convenience
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => secureStorage),
            skipHydration: false,
        }
    )
);
