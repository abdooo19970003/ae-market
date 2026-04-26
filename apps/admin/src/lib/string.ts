/**
 * Converts a camelCase string to snake_case.
 * Example: createdAt -> created_at
 */
export const toSnakeCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
