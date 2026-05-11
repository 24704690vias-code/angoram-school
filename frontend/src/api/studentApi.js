import api from './client';

/** Get all students */
export const getStudents = () =>
  api.get('/students').then(r => r.data);

/** Get a single student by ID */
export const getStudent = (id) =>
  api.get(`/students/${id}`).then(r => r.data);

/** Create a new student record */
export const createStudent = (data) =>
  api.post('/students', data).then(r => r.data);

/** Update an existing student */
export const updateStudent = (id, data) =>
  api.put(`/students/${id}`, data).then(r => r.data);

/** Delete a student */
export const deleteStudent = (id) =>
  api.delete(`/students/${id}`).then(r => r.data);

/**
 * Update a student's status (ACTIVE, SUSPENDED, WITHDRAWN, EXPELLED, GRADUATED)
 * @param {number} id - student ID
 * @param {string} status - new status value
 * @param {string} reason - reason for the change
 */
export const updateStudentStatus = (id, status, reason) =>
  api.put(`/students/${id}/status`, null, {
    params: { status, reason },
  }).then(r => r.data);

/**
 * Assign a student to a class
 * @param {number} studentId
 * @param {number} classId
 */
export const assignStudentToClass = (studentId, classId) =>
  api.put(`/students/${studentId}/assign-class`, null, {
    params: { classId },
  }).then(r => r.data);

/** Get the status change audit log for a student */
export const getStudentStatusLog = (id) =>
  api.get(`/students/${id}/status-log`).then(r => r.data);
