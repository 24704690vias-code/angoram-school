import api from './client';

/**
 * Get all year-end results for a given academic year.
 * @param {number} yearId
 */
export const getYearEndResults = (yearId) =>
  api.get('/year-end', { params: { yearId } }).then(r => r.data);

/**
 * Process and save a year-end outcome for one student.
 * 
 *
 * @param {object} data
 * @param {number} data.studentId
 * @param {number} data.academicYearId
 * @param {string} data.outcome - PROMOTED | REPEAT | GRADUATED | SELECTED_GRADE11 | WITHDRAWN | EXPELLED
 * @param {number|null} data.nextGradeLevel - Grade level for next year (null if not continuing)
 * @param {number|null} data.finalAverage - Final average score (optional)
 * @param {number|null} data.attendancePct - Attendance percentage (optional)
 * @param {string|null} data.notes - Additional notes (optional)
 */
export const processYearEnd = (data) =>
  api.post('/year-end/process', data).then(r => r.data);
