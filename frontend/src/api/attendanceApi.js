import api from './client';

/**
 * Get the attendance roll for a class on a specific date.
 * 
 * @param {number} classId
 * @param {string} date - ISO date string e.g. "2026-04-28"
 */
export const getAttendanceRoll = (classId, date) =>
  api.get('/attendance', { params: { classId, date } }).then(r => r.data);

/**
 * Save an entire class's attendance roll in one request.
 * @param {Array} records - array of attendance objects
 * @param {number} yearId - current academic year ID
 */
export const saveAttendanceBulk = (records, yearId) =>
  api.post('/attendance/bulk', records, {
    params: { yearId },
  }).then(r => r.data);

/**
 * Get all attendance records for a student in a given year.
 * @param {number} studentId
 * @param {number} yearId
 */
export const getStudentAttendance = (studentId, yearId) =>
  api.get(`/attendance/student/${studentId}`, {
    params: { yearId },
  }).then(r => r.data);

/**
 * Get an attendance summary for a student (present/absent/late/excused counts + %).
 * @param {number} studentId
 * @param {number} yearId
 */
export const getAttendanceSummary = (studentId, yearId) =>
  api.get(`/attendance/student/${studentId}/summary`, {
    params: { yearId },
  }).then(r => r.data);
