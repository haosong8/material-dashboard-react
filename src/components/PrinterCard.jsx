// src/components/PrinterCard.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { connectPrinter } from "api/printer"; // POST to /printers/connect
import usePrinterSocket from "hooks/usePrinterSocket";

// Helper function to capitalize the first letter.
const capitalizeStatus = (status) =>
  status && typeof status === "string" ? status.charAt(0).toUpperCase() + status.slice(1) : status;

// Helper function to format seconds as HH:MM:SS.
const formatSecondsToHHMMSS = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const PrinterCard = ({ printer }) => {
  const {
    printer_id,
    printer_name = "Unnamed Printer",
    printer_model = "N/A",
    ip_address = "0.0.0.0",
    port = 80,
    status = "Unknown",
    progress = "0%",
    finish = "N/A",
    queued = "0",
    extruder = "N/A",
    heaterBed = "N/A",
  } = printer;

  // Local state for connection status, dynamic data, and ETA.
  const [localStatus, setLocalStatus] = useState(status);
  const [dynamicData, setDynamicData] = useState({
    progress,
    finish,
    queued,
    extruder,
    heaterBed,
  });
  const [eta, setEta] = useState(null);

  // Update local status when printer prop changes.
  useEffect(() => {
    setLocalStatus(printer.status);
  }, [printer.status]);

  const webcamUrl = `http://${ip_address}/webcam/?action=stream`;

  const handleConnect = () => {
    connectPrinter(ip_address)
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

          // If toolhead info is provided and printer is printing, calculate ETA.
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

  // Memoize the socket onData callback.
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
      }));
      if (statusData.print_stats && typeof statusData.print_stats.state === "string") {
        setLocalStatus(statusData.print_stats.state);
      }
      // Update progress from display_status if printing.
      if (
        statusData.print_stats &&
        statusData.print_stats.state === "printing" &&
        statusData.display_status &&
        typeof statusData.display_status.progress !== "undefined"
      ) {
        setDynamicData((prevData) => ({
          ...prevData,
          progress: statusData.display_status.progress,
        }));
      }
      // Calculate ETA if toolhead info is available and printing.
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

  // Activate the Socket.IO connection if the printer is not "disconnected".
  const activateSocket = localStatus && localStatus.toLowerCase() !== "disconnected";
  usePrinterSocket(ip_address, handleSocketData, activateSocket);

  return (
    <Card sx={{ maxWidth: 500, m: 2 }}>
      <CardContent>
        <MDTypography variant="h5" fontWeight="bold" align="center" mt={1} mb={1}>
          {printer_name}
        </MDTypography>
        <MDBox
          sx={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
            mb: 3,
          }}
        >
          <CardMedia
            component="img"
            image={webcamUrl}
            alt={`Webcam feed of ${printer_name}`}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "93.5%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </MDBox>
        <MDBox mt={2} mb={2}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <MDTypography variant="body2">
                <strong>Status:</strong> {capitalizeStatus(localStatus)}
              </MDTypography>
              {localStatus.toLowerCase() === "printing" && (
                <MDTypography variant="body2">
                  <strong>Progress:</strong> {dynamicData.progress}
                </MDTypography>
              )}
              <MDTypography variant="body2">
                <strong>Queued:</strong> {dynamicData.queued}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              {eta && (
                <MDTypography variant="body2">
                  <strong>ETA:</strong> {eta}
                </MDTypography>
              )}
              <MDTypography variant="body2">
                <strong>Extruder:</strong> {dynamicData.extruder}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Heater Bed:</strong> {dynamicData.heaterBed}
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item>
            <MDButton variant="contained" color="info" onClick={handleConnect}>
              Connect
            </MDButton>
          </Grid>
          <Grid item>
            <MDButton variant="contained" color="error">
              Stop Print
            </MDButton>
          </Grid>
          <Grid item>
            <MDButton variant="contained" color="success">
              Start Next Print
            </MDButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

PrinterCard.propTypes = {
  printer: PropTypes.shape({
    printer_id: PropTypes.number.isRequired,
    printer_name: PropTypes.string,
    printer_model: PropTypes.string,
    ip_address: PropTypes.string,
    port: PropTypes.number,
    status: PropTypes.string,
    progress: PropTypes.string,
    finish: PropTypes.string,
    queued: PropTypes.string,
    extruder: PropTypes.string,
    heaterBed: PropTypes.string,
  }).isRequired,
};

export default PrinterCard;
