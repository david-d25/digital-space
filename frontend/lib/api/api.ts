import axios, {AxiosRequestConfig} from "axios";
import Router from "next/router";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Redirecting to `/login` if there's authorization problem
instance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
            if (!window.location.pathname.startsWith('/login')) {
                const returnUrl = window.location.pathname + window.location.search;
                Router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`).then(() => {});
            }
        }
        return Promise.reject(error);
    }
);

export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        instance.get<T>(url, config).then(res => res.data),

    post: <T, U = any>(url: string, data?: U, config?: AxiosRequestConfig) =>
        instance.post<T>(url, data, config).then(res => res.data),

    put: <T, U = any>(url: string, data?: U, config?: AxiosRequestConfig) =>
        instance.put<T>(url, data, config).then(res => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        instance.delete<T>(url, config).then(res => res.data),

    subscribe: <T>(
        endpoint: string,
        onMessage: (data: T) => void,
        onError?: (err: any) => void,
    ) => {
        const es = new EventSource(`${instance.defaults.baseURL}${endpoint}`)
        es.onmessage = e => onMessage(JSON.parse(e.data))
        if (onError) es.onerror = onError
        return () => es.close()
    },

    uploadWithProgress: async <T>(
        url: string,
        file: File,
        additionalData?: Record<string, any>,
        onUploadProgress?: (progressEvent: { loaded: number; total: number; percentage: number }) => void
    ) => {
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
        }

        const res = await instance.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent_2) => {
                if (onUploadProgress && progressEvent_2.total) {
                    const loaded = progressEvent_2.loaded;
                    const total = progressEvent_2.total;
                    const percentage = Math.round((loaded * 100) / total);
                    onUploadProgress({loaded, total, percentage});
                }
            },
        });
        return res.data;
    },
}