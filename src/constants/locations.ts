/**
 * Shared location constants for the Campus Night Market application
 * Used across listing forms, filters, and profile pages
 */

export const LOCATIONS = [
  'Cunningham Hall',
  'Kacek Hall',
  'Carmen Hall',
  'MSV',
  'Rowe North',
  'Rowe Middle',
  'Rowe South',
  'The Quad',
] as const;

export const ALL_LOCATIONS_OPTION = 'All Dorms';

export type Location = (typeof LOCATIONS)[number];
