import api from './client';

/**
 * Login with username and password.
 * 
 */
export const login = (credentials) =>
  api.post('/auth/login', credentials).then(r => r.data);
