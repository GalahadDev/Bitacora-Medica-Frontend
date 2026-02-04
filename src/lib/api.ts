import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export const endpoints = {

    dashboard: {
        getSummary: () => api.get('/dashboard/summary'),
    },

    auth: {

        updateProfile: (data: any) =>
            api.put('/auth/profile', data),

        getMe: () => api.get('/auth/me'),
    },
    uploads: {
        consent: (formData: FormData, patientId: string) => {
            formData.append('patient_id', patientId);

            return api.post('/uploads/consent', formData);
        },
        image: (formData: FormData, patientId: string) => {
            formData.append('patient_id', patientId);

            return api.post('/uploads/image', formData);
        },
    },

    patients: {

        create: (data: any) => api.post('/patients/', data),

        list: () => api.get('/patients/'),

        getById: (id: string) => api.get(`/patients/${id}`),

        update: (id: string, data: { disability_report: string; care_notes: string }) =>
            api.put(`/patients/${id}`, data),

        getAIContext: (id: string) => api.get(`/patients/${id}/ai-context`),

        getDocuments: (id: string) => api.get(`/patients/${id}/documents`),

        uploadDocument: (id: string, formData: FormData) => api.post(`/patients/${id}/documents`, formData),

        deleteDocument: (docId: string) => api.delete(`/patients/documents/${docId}`),
    },

    sessions: {

        list: (patientId: string, professionalId?: string) => {
            let url = `/sessions/?patient_id=${patientId}`;
            if (professionalId) {
                url += `&professional_id=${professionalId}`;
            }
            return api.get(url);
        },

        create: (data: any) => api.post('/sessions/', data),

        update: (id: string, data: any) => api.put(`/sessions/${id}`, data),

        delete: (id: string) => api.delete(`/sessions/${id}`),
    },

    reports: {

        list: (patientId: string) => api.get(`/reports/list?patient_id=${patientId}`),

        create: (data: any) => api.post('/reports', data),

        getMaster: (patientId: string, start: string, end: string) =>
            api.get(`/reports/master?patient_id=${patientId}&start_date=${start}&end_date=${end}`),
    },

    collaborations: {
        invite: (data: { patient_id: string; email: string }) =>
            api.post('/collaborations/invite', data),

        getPending: () => api.get('/collaborations/pending'),

        respond: (id: string, status: 'ACCEPTED' | 'REJECTED') =>
            api.put(`/collaborations/${id}/respond`, { status }),

        delete: (id: string) => api.delete(`/collaborations/${id}`),
    },

    admin: {

        getDashboard: () => api.get('/admin/dashboard'),

        getPendingUsers: () => api.get('/admin/users/pending'),

        reviewUser: (userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
            const action = status === 'APPROVED' ? 'APPROVE' : 'REJECT';
            return api.put(`/admin/users/${userId}/review`, { action, reject_reason: reason });
        },
    },

    support: {

        create: (data: { subject: string; message: string }) => api.post('/support/', data),

        list: () => api.get('/support/'),

        reply: (id: string, response: string) => api.put(`/support/${id}/reply`, { response }),
    },
};

export default api;