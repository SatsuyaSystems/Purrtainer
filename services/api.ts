import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const api = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const { serverUrl, token } = useAuthStore.getState();

        if (serverUrl) {
            config.baseURL = serverUrl;
            // Add Referer header - required by Portainer for certain operations
            config.headers['Referer'] = serverUrl;
        }

        if (token) {
            // Portainer API accepts token as X-API-Token header
            config.headers['X-API-Token'] = token;
            // Also try Authorization header for compatibility
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Disable CSRF protection for container action endpoints and exec endpoints
        // All docker container and exec operations need this
        if (config.url?.includes('/docker/containers/') || config.url?.includes('/docker/exec/')) {
            config.withCredentials = false;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
