/**
 * Formats bytes into human readable format.
 *
 * @param {number | undefined} bytes - The number of bytes to format.
 * @returns {string} The formatted string with appropriate unit (B, KB, MB, GB, TB). Returns an empty string if bytes is undefined or 0.
 */
export const formatBytes = (bytes?: number | undefined): string => {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Converts a Date object or a value that can be converted to a Date, to an ISO string representation.
 *
 * @param {Date | undefined} d The Date object or value to convert. If undefined, returns an empty string.
 * @returns {string} The ISO string representation of the Date, or an empty string if the input is undefined.
 *                   If the input is not a valid Date, it returns the string representation of the input.
 */
export const toISO = (d: Date | undefined): string => {
  if (!d) return "";
  if (d instanceof Date) return d.toISOString();
  try {
    return new Date(d).toISOString();
  } catch {
    return String(d);
  }
};

/**
 * Formats a given date into a human-readable relative time string.
 *
 * @param {Date | undefined} d - The date to format. If undefined, returns an empty string.
 * @returns {string} A string representing the relative time since the given date.
 *                   Examples: "Few seconds ago", "5 minutes ago", "1 hour ago", "2 days ago", "In the future", or "".
 */
export const formatDate = (d: Date | undefined): string => {
  if (!d) return "";
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 0) return "In the future";
  if (diffInSeconds < 45) return "Few seconds ago";

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};
