import api from './client';

/**
 * Get all assessment records for a class in a given term.
 * @param {number} classId
 * @param {number} termId
 */
export const getAssessments = (classId, termId) =>
  api.get('/assessments', { params: { classId, termId } }).then(r => r.data);

/**
 * Save or update a single student's mark for a subject/term.
 * 
 * @param {object} data - assessment fields
 */
export const saveAssessment = (data) =>
  api.post('/assessments', data).then(r => r.data);

/**
 * Get class rankings for a given class and term.
 * Returns students sorted by average score with rank positions.
 * @param {number} classId
 * @param {number} termId
 */
export const getClassRankings = (classId, termId) =>
  api.get('/assessments/rankings', { params: { classId, termId } }).then(r => r.data);

/**
 * Get all assessment records for a student across a full academic year.
 * @param {number} studentId
 * @param {number} yearId
 */
export const getStudentAssessments = (studentId, yearId) =>
  api.get(`/assessments/student/${studentId}`, {
    params: { yearId },
  }).then(r => r.data);
