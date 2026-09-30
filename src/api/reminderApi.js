import apiClient from './apiClient';

export const getReminders = () => apiClient.get('/reminders');
export const getTodayReminders = () =>
  apiClient.get('/reminders/today').catch(() => ({ data: [] }));
export const createReminder = (data) => apiClient.post('/reminders', data);
