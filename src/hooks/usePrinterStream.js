// src/hooks/usePrinterStream.js
import { useEffect } from "react";

const usePrinterStream = (printerIp, onData, active = true) => {
  useEffect(() => {
    if (!active) return;

    const eventSource = new EventSource(
      `http://localhost:5000/printers/connect/stream/${printerIp}`
    );
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onData(data);
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };
    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [printerIp, onData, active]);
};

export default usePrinterStream;
