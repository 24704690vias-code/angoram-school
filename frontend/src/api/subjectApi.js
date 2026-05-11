import api from './client';

/** Get all subjects */
export const getSubjects = () =>
  api.get('/subjects').then(r => r.data);

/** Create a new subject */
export const createSubject = (data) =>
  api.post('/subjects', data).then(r => r.data);

/** Update an existing subject */
export const updateSubject = (id, data) =>
  api.put(`/subjects/${id}`, data).then(r => r.data);

/** Delete a subject */
export const deleteSubject = (id) =>
  api.delete(`/subjects/${id}`).then(r => r.data);
