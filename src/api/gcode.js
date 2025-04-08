// src/api/gcode.js
import API_BASE_URL from "./config";

/**
 * Fetches and updates gcodes (combined bulk endpoint) for a specific printer.
 * @param {string} printerIp - The IP address of the printer.
 * @returns {Promise<Object>} The JSON response from the backend.
 */
export const fetchGcodes = async (printerIp) => {
  const response = await fetch(`${API_BASE_URL}/gcode/${printerIp}/get_gcode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch gcodes");
  }
  return response.json();
};

/**
 * Updates the historical print time for gcodes of a specific printer.
 * @param {string} printerIp - The IP address of the printer.
 * @returns {Promise<Object>} The JSON response from the backend.
 */
export const updateHistoricalPrintTime = async (printerIp) => {
  const response = await fetch(`${API_BASE_URL}/gcode/${printerIp}/update_history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to update historical print time");
  }
  return response.json();
};

/**
 * (Optional) Retrieves all gcodes from the backend.
 * @returns {Promise<Object[]>} The JSON array of all gcodes.
 */
export const getAllGcodes = async () => {
  const response = await fetch(`${API_BASE_URL}/gcode/`);
  if (!response.ok) {
    throw new Error("Failed to get all gcodes");
  }
  return response.json();
};
