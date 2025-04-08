// src/api/printers.js
import API_BASE_URL from "./config";

export const fetchPrinters = async () => {
  const response = await fetch(`${API_BASE_URL}/printers/`);
  if (!response.ok) {
    throw new Error("Failed to fetch printers");
  }
  return response.json();
};

export async function connectPrinter(ipAddress) {
  const response = await fetch(`${API_BASE_URL}/printers/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip_address: ipAddress }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect printer");
  }

  return response.json();
}

export async function getPrinterbyIP(ipAddress) {
  const response = await fetch(`${API_BASE_URL}/printers/${ipAddress}/details`);
  if (!response.ok) {
    throw new Error("Failed to fetch printers");
  }
  return response.json();
}
