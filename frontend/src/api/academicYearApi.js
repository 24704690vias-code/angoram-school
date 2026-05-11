import api from './client';

/** Get all academic years */
export const getAcademicYears = () =>
  api.get('/academic-years').then(r => r.data);

/** Get the current (active) academic year */
export const getCurrentYear = () =>
  api.get('/academic-years/current').then(r => r.data);

/**
 * Get all terms for a given academic year
 * @param {number} yearId - academic year ID
 */
export const getTerms = (yearId) =>
  api.get(`/academic-years/${yearId}/terms`).then(r => r.data);
