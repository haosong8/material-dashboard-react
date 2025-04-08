// src/components/PrinterDynamicData.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { connectPrinter } from "api/printer";
import usePrinterSocket from "hooks/usePrinterSocket";
import { formatSecondsToHHMMSS } from "utils/helpers";

const PrinterDynamicData = ({ ipAddress, initialStatus, initialDynamicData, children }) => {
  const [localStatus, setLocalStatus] = useState(initialStatus);
  const [dynamicData, setDynamicData] = useState(initialDynamicData);
  const [eta, setEta] = useState(null);

  // Update local status if initialStatus changes.
  useEffect(() => {
    setLocalStatus(initialStatus);
  }, [initialStatus]);

  // Socket update handler.
  const handleSocketData = useCallback((data) => {
    if (data && data.result && data.result.status) {
      const statusData = data.result.status;
      setDynamicData((prevData) => ({
        ...prevData,
        extruder:
          statusData.extruder && statusData.extruder.temperature !== undefined
            ? `${statusData.extruder.temperature}°C`
            : prevData.extruder,
        heaterBed:
          statusData.heater_bed && statusData.heater_bed.temperature !== undefined
            ? `${statusData.heater_bed.temperature}°C`
            : prevData.heaterBed,
        progress:
          statusData.display_status && typeof statusData.display_status.progress !== "undefined"
            ? statusData.display_status.progress
            : prevData.progress,
      }));
      if (statusData.print_stats && typeof statusData.print_stats.state === "string") {
        setLocalStatus(statusData.print_stats.state);
      }
      if (
        statusData.toolhead &&
        statusData.toolhead.estimated_print_time &&
        statusData.print_stats.print_duration !== undefined &&
        statusData.print_stats.state === "printing"
      ) {
        const est = statusData.toolhead.estimated_print_time;
        const current = statusData.print_stats.print_duration;
        const remaining = Math.max(0, est - current);
        setEta(formatSecondsToHHMMSS(remaining));
      }
    }
  }, []);

  // Activate socket if not disconnected.
  const activateSocket = localStatus && localStatus.toLowerCase() !== "disconnected";
  usePrinterSocket(ipAddress, handleSocketData, activateSocket);

  // Function to connect the printer.
  const handleConnect = () => {
    connectPrinter(ipAddress)
      .then((data) => {
        const newStatus = data.printer.status || "Connected";
        setLocalStatus(newStatus);
        if (data.initial_state && data.initial_state.result && data.initial_state.result.status) {
          const statusData = data.initial_state.result.status;
          const extruderTemp =
            statusData.extruder && statusData.extruder.temperature !== undefined
              ? `${statusData.extruder.temperature}°C`
              : dynamicData.extruder;
          const heaterBedTemp =
            statusData.heater_bed && statusData.heater_bed.temperature !== undefined
              ? `${statusData.heater_bed.temperature}°C`
              : dynamicData.heaterBed;
          setDynamicData((prevData) => ({
            ...prevData,
            extruder: extruderTemp,
            heaterBed: heaterBedTemp,
          }));
          if (
            statusData.toolhead &&
            statusData.toolhead.estimated_print_time &&
            statusData.toolhead.print_time !== undefined &&
            statusData.print_stats.state === "printing"
          ) {
            const est = statusData.toolhead.estimated_print_time;
            const current = statusData.toolhead.print_time;
            const remaining = Math.max(0, est - current);
            setEta(formatSecondsToHHMMSS(remaining));
          }
        }
      })
      .catch((err) => {
        console.error("Error connecting to printer:", err);
      });
  };

  // Render children as a function passing the dynamic state and connect function.
  return children({ localStatus, dynamicData, eta, handleConnect });
};

PrinterDynamicData.propTypes = {
  ipAddress: PropTypes.string.isRequired,
  initialStatus: PropTypes.string,
  initialDynamicData: PropTypes.shape({
    progress: PropTypes.string,
    finish: PropTypes.string,
    queued: PropTypes.string,
    extruder: PropTypes.string,
    heaterBed: PropTypes.string,
  }),
  children: PropTypes.func.isRequired,
};

PrinterDynamicData.defaultProps = {
  initialStatus: "Unknown",
  initialDynamicData: {
    progress: "0%",
    finish: "N/A",
    queued: "0",
    extruder: "N/A",
    heaterBed: "N/A",
  },
};

export default PrinterDynamicData;
