import apiClient from './apiClient';

export const getApplications = () => apiClient.get('/applications');
export const getApplication = (id) => apiClient.get(`/applications/${id}`);
export const createApplication = (data) => apiClient.post('/applications', data);
export const deleteApplication = (id) => apiClient.delete(`/applications/${id}`);
