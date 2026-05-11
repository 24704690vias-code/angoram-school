/**
 * studentMapper.js — normalise raw API shapes.
 */
export function toDisplayName(s) {
  return `${s.firstname ?? s.student_firstname ?? ''} ${s.lastname ?? s.student_lastname ?? ''}`.trim();
}
export function getId(s) { return s.id ?? s.student_id; }
