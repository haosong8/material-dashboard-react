// src/utils/helpers.js

/**
 * Capitalizes the first letter of the status string.
 * @param {string} status
 * @returns {string} The capitalized status.
 */
export const capitalizeStatus = (status) => {
  return status && typeof status === "string"
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : status;
};

/**
 * Formats a total number of seconds as HH:MM:SS.
 * @param {number} totalSeconds
 * @returns {string} The formatted time.
 */
export const formatSecondsToHHMMSS = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
