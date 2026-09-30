import apiClient from './apiClient';

export const getStudents = () => apiClient.get('/students');
export const getStudent = (id) => apiClient.get(`/students/${id}`);
export const createStudent = (data) => apiClient.post('/students', data);
export const deleteStudent = (id) => apiClient.delete(`/students/${id}`);
