/**
 * Construct a full image URL for display
 * Handles both relative paths and full URLs
 */
export const getImageUrl = (path) => {
  if (!path) return null;

  // If already a full URL (starts with http) return as is
  if (path.startsWith('http')) return path;

  // Otherwise prepend backend storage URL
  const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:5000';

  // Remove leading slash if present to avoid double slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${storageUrl}/${cleanPath}`;
};
