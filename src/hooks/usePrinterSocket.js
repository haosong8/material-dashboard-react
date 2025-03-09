// src/hooks/usePrinterSocket.js
import { useEffect } from "react";
import io from "socket.io-client";

// Global cache: a dictionary mapping printer IP to a Socket.IO instance.
const socketCache = {};

const usePrinterSocket = (printerIp, onData, active = true) => {
  useEffect(() => {
    if (!active || !printerIp) return;

    // If a socket already exists for this printer, reuse it.
    if (socketCache[printerIp]) {
      // Detach any previous listener and attach the new onData listener.
      socketCache[printerIp].off("printer_update");
      socketCache[printerIp].on("printer_update", onData);
      return;
    }

    // Otherwise, create a new Socket.IO connection.
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"],
      query: { printerIp },
    });

    newSocket.on("connect", () => {
      console.log(`Socket connected for printer ${printerIp}`);
    });

    newSocket.on("printer_update", (data) => {
      console.log(`Received printer update for ${printerIp}:`, data);
      onData(data);
    });

    newSocket.on("disconnect", () => {
      console.log(`Socket disconnected for printer ${printerIp}`);
    });

    // Store in the global cache so subsequent hook calls reuse it.
    socketCache[printerIp] = newSocket;

    // We do not disconnect on unmount if other components may use the same connection.
    // If you need to disconnect when no components remain, you'll need additional reference counting logic.
  }, [printerIp, onData, active]);
};

export default usePrinterSocket;
