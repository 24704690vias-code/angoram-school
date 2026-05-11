/**
 * feesApi.js — single source of truth for all fee API calls.
 * Replaces the old split between feeApi.js and feesApi.js.
 */
import api from './client';

/** All fee payment records */
export const getFees = () =>
  api.get('/fees').then(r => r.data);

/** All levy types for an academic year */
export const getLevyTypes = (yearId) =>
  api.get('/fees/levies', { params: { yearId } }).then(r => r.data);

/** All payments for one student */
export const getFeesByStudent = (studentId) =>
  api.get(`/fees/student/${studentId}`).then(r => r.data);

/** Payment summary for a student in a given year */
export const getFeesSummary = (studentId, yearId) =>
  api.get(`/fees/student/${studentId}/summary`, {
    params: yearId ? { yearId } : {},
  }).then(r => r.data);

/** Record a new payment (with optional receipt file)
 *  Uses fetch() directly instead of axios to avoid Vite proxy issues
 *  with multipart/form-data — proxy can mangle the boundary.
 *
 *  Field mapping: FeeModal uses { studentId, paymentTotal, paymentMethod, ... }
 *  FeeController expects: { studentId, amountPaid, paymentMethod, yearId, ... }
 */
export const createFee = (data, receiptFile = null) => {
  const token = localStorage.getItem('token');
  const form = new FormData();

  // Map frontend field names to what the backend @RequestParam names expect
  const mapped = {
    studentId:       data.studentId,
    amountPaid:      data.amountPaid ?? data.paymentTotal,  // rename
    paymentMethod:   data.paymentMethod,
    yearId:          data.yearId ?? null,                   // optional, backend auto-detects
    levyTypeId:      data.levyTypeId ?? null,
    referenceNumber: data.referenceNumber ?? null,
    receiptNumber:   data.receiptNumber   ?? null,
    notes:           data.notes           ?? null,
  };

  Object.entries(mapped).forEach(([k, v]) => {
    if (v != null) form.append(k, v);
  });
  if (receiptFile) form.append('receiptFile', receiptFile);

  // Use fetch directly to backend — avoids Vite proxy mangling multipart boundary
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  return fetch(`${base}/fees/record`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
     
    },
    body: form,
  }).then(async r => {
    if (!r.ok) {
      const err = await r.text().catch(() => r.statusText);
      throw new Error(err || `HTTP ${r.status}`);
    }
    return r.json();
  });
};

// Alias for feesService compatibility
export const recordPayment = createFee;

/** Delete a payment record */
export const deleteFee = (id) =>
  api.delete(`/fees/${id}`).then(r => r.data);

export const deletePayment = deleteFee;

/** Attach / replace a receipt on an existing payment */
export const uploadReceipt = (id, file) => {
  const form = new FormData();
  form.append('receiptFile', file);
  return api.post(`/fees/${id}/receipt`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

/** Remove receipt from an existing payment */
export const removeReceipt = (id) =>
  api.delete(`/fees/${id}/receipt`).then(r => r.data);

/** URL to view a receipt inline — works in dev (proxy) and production */
export const getReceiptUrl = (id) => {
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/fees/${id}/receipt`;
};