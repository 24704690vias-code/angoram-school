import api from './client';

/**
 * Get all annual registrations for a given academic year
 * @param {number} yearId
 */
export const getRegistrations = (yearId) =>
  api.get('/registrations', { params: { yearId } }).then(r => r.data);

/**
 * Register a student for an academic year
 * @param {{ studentId: number, yearId: number, notes?: string }} data
 */
export const registerStudent = (data) =>
  api.post('/registrations', data).then(r => r.data);

/**
 * Update a registration record (e.g. change status to WITHDRAWN)
 * @param {number} id - registration ID
 * @param {object} data - updated fields
 */
export const updateRegistration = (id, data) =>
  api.put(`/registrations/${id}`, data).then(r => r.data);
