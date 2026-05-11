import api from './client';

/**
 * Get all classes, optionally filtered by academic year ID.
 * 
 */
export const getClasses = (yearId) =>
  api.get('/classes', { params: yearId ? { yearId } : {} }).then(r => r.data);

/** Get a single class by ID */
export const getClass = (id) =>
  api.get(`/classes/${id}`).then(r => r.data);

/** Create a new class */
export const createClass = (data) =>
  api.post('/classes', data).then(r => r.data);

/** Update an existing class */
export const updateClass = (id, data) =>
  api.put(`/classes/${id}`, data).then(r => r.data);

/** Delete a class */
export const deleteClass = (id) =>
  api.delete(`/classes/${id}`).then(r => r.data);

/** Get all active students assigned to a class */
export const getClassStudents = (classId) =>
  api.get(`/classes/${classId}/students`).then(r => r.data);
