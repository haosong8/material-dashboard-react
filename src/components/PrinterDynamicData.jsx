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

  // Keep status in sync
  useEffect(() => {
    setLocalStatus(initialStatus);
  }, [initialStatus]);

  // Helpers
  const calcRemainingSeconds = (elapsed, progress) => {
    if (progress <= 0) return null;
    const totalTime = elapsed / progress;
    return Math.max(0, totalTime - elapsed);
  };

  // Handle incoming socket data
  const handleSocketData = useCallback(
    (data) => {
      const s = data?.result?.status;
      if (!s) return;

      // Temperatures
      const extruderTemp =
        s.extruder?.temperature != null && s.extruder.target != null
          ? `${Math.round(s.extruder.temperature)}°C / ${Math.round(s.extruder.target)}°C`
          : dynamicData.extruder;
      const heaterBedTemp =
        s.heater_bed?.temperature != null && s.heater_bed.target != null
          ? `${Math.round(s.heater_bed.temperature)}°C / ${Math.round(s.heater_bed.target)}°C`
          : dynamicData.heaterBed;
      const chamberRaw = s["temperature_sensor chamber_temp"]?.temperature;
      const chamberTemp =
        chamberRaw != null ? `${Math.round(chamberRaw)}°C` : dynamicData.chamberTemp;

      // File info
      const filename = s.print_stats?.filename || dynamicData.filename;
      const rawProgress = s.virtual_sdcard?.progress;
      const progress =
        rawProgress != null ? `${Math.round(rawProgress * 100)}%` : dynamicData.progress;

      // Filament used (convert mm → m)
      const filamentUsed =
        s.print_stats?.filament_used != null
          ? `${(s.print_stats.filament_used / 1000).toFixed(2)}m`
          : dynamicData.filamentUsed;

      // Layer info
      const layer =
        s.virtual_sdcard?.layer != null && s.virtual_sdcard.layer_count != null
          ? `${s.virtual_sdcard.layer} / ${s.virtual_sdcard.layer_count}`
          : dynamicData.layer;

      // ETA + finish time
      let newEta = eta;
      let finishTime = dynamicData.finish;
      if (
        s.print_stats?.print_duration != null &&
        rawProgress != null &&
        s.print_stats.state === "printing"
      ) {
        const remainingSecs = calcRemainingSeconds(s.print_stats.print_duration, rawProgress);
        if (remainingSecs != null) {
          newEta = formatSecondsToHHMMSS(remainingSecs);
          finishTime = new Date(Date.now() + remainingSecs * 1000).toLocaleTimeString();
        }
      }

      // Update all dynamic fields at once
      setDynamicData((prev) => ({
        ...prev,
        extruder: extruderTemp,
        heaterBed: heaterBedTemp,
        chamberTemp,
        filename,
        progress,
        filamentUsed,
        layer,
        finish: finishTime,
      }));

      if (newEta != null) {
        setEta(newEta);
      }
      if (s.print_stats?.state) {
        setLocalStatus(s.print_stats.state);
      }
    },
    [dynamicData, eta]
  );

  const activateSocket = localStatus?.toLowerCase() !== "disconnected";
  usePrinterSocket(ipAddress, handleSocketData, activateSocket);

  // On initial connect, seed dynamicData & ETA
  const handleConnect = () => {
    connectPrinter(ipAddress)
      .then(({ printer, initial_state }) => {
        setLocalStatus(printer.status || "connected");
        const s = initial_state?.result?.status;
        if (!s) return;

        // (Repeat same logic as socket data for initial values)
        const extruderTemp =
          s.extruder?.temperature != null && s.extruder.target != null
            ? `${Math.round(s.extruder.temperature)}°C / ${Math.round(s.extruder.target)}°C`
            : dynamicData.extruder;
        const heaterBedTemp =
          s.heater_bed?.temperature != null && s.heater_bed.target != null
            ? `${Math.round(s.heater_bed.temperature)}°C / ${Math.round(s.heater_bed.target)}°C`
            : dynamicData.heaterBed;
        const chamberRaw = s["temperature_sensor chamber_temp"]?.temperature;
        const chamberTemp =
          chamberRaw != null ? `${Math.round(chamberRaw)}°C` : dynamicData.chamberTemp;
        const filename = s.print_stats?.filename || dynamicData.filename;
        const rawProgress = s.virtual_sdcard?.progress;
        const progress =
          rawProgress != null ? `${Math.round(rawProgress * 100)}%` : dynamicData.progress;
        const filamentUsed =
          s.print_stats?.filament_used != null
            ? `${(s.print_stats.filament_used / 1000).toFixed(2)} m`
            : dynamicData.filamentUsed;
        const layer =
          s.virtual_sdcard?.layer != null && s.virtual_sdcard.layer_count != null
            ? `${s.virtual_sdcard.layer} / ${s.virtual_sdcard.layer_count}`
            : dynamicData.layer;

        let newEta = eta;
        let finishTime = dynamicData.finish;
        if (
          s.print_stats?.print_duration != null &&
          rawProgress != null &&
          s.print_stats.state === "printing"
        ) {
          const remainingSecs = calcRemainingSeconds(s.print_stats.print_duration, rawProgress);
          if (remainingSecs != null) {
            newEta = formatSecondsToHHMMSS(remainingSecs);
            finishTime = new Date(Date.now() + remainingSecs * 1000).toLocaleTimeString();
          }
        }

        setDynamicData((prev) => ({
          ...prev,
          extruder: extruderTemp,
          heaterBed: heaterBedTemp,
          chamberTemp,
          filename,
          progress,
          filamentUsed,
          layer,
          finish: finishTime,
        }));
        if (newEta != null) setEta(newEta);
      })
      .catch((err) => console.error("Error connecting to printer:", err));
  };

  // Pass everything down to children renderer
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
    chamberTemp: PropTypes.string,
    filename: PropTypes.string,
    filamentUsed: PropTypes.string,
    layer: PropTypes.string,
  }).isRequired,
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
    chamberTemp: "N/A",
    filename: "",
    filamentUsed: "N/A",
    layer: "N/A",
  },
};

export default PrinterDynamicData;
