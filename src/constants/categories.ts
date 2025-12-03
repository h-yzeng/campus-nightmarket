/**
 * Shared category constants for the Campus Night Market application
 * Used across listing forms and filters
 */

export const CATEGORIES = ['Meals', 'Snacks', 'Desserts', 'Drinks', 'Other'] as const;

export const ALL_CATEGORIES_OPTION = 'All Categories';

export type Category = (typeof CATEGORIES)[number];
