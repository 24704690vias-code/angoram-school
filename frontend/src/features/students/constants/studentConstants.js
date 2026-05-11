/**
 * models/index.js
 * Plain JS objects describing the default shape of each entity.
 * Used to initialise forms and as a reference for field names.
 */

export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

export const ASSESSMENT_TYPES = ['CONTINUOUS', 'FINAL_EXAM', 'COMBINED'];

export const PROVINCES = [
  'Central', 'Chimbu', 'East New Britain', 'East Sepik', 'Eastern Highlands',
  'Enga', 'Gulf', 'Hela', 'Jiwaka', 'Madang', 'Manus', 'Milne Bay', 'Morobe',
  'National Capital District', 'New Ireland', 'Oro', 'Sandaun',
  'Southern Highlands', 'West New Britain', 'West Sepik', 'Western',
  'Western Highlands',
];

export const GRADES = [9, 10, 11, 12];

// Colour map for student statuses — used by Dashboard and Reports
export const STATUS_COLORS = {
  ACTIVE:    '46,160,67',
  GRADUATED: '56,139,253',
  SUSPENDED: '210,153,34',
  WITHDRAWN: '125,133,144',
  EXPELLED:  '248,81,73',
};

// Hex versions for SVG / inline use
export const STATUS_HEX = {
  ACTIVE:    '#2ea043',
  GRADUATED: '#388bfd',
  SUSPENDED: '#d29922',
  WITHDRAWN: '#7d8590',
  EXPELLED:  '#f85149',
};
