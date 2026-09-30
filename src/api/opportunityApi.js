import apiClient from './apiClient';

export const getOpportunities = () => apiClient.get('/opportunities');
export const getOpportunity = (id) => apiClient.get(`/opportunities/${id}`);
export const createOpportunity = (data) => apiClient.post('/opportunities', data);
export const deleteOpportunity = (id) => apiClient.delete(`/opportunities/${id}`);
