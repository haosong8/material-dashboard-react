// src/components/PrinterCard.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { connectPrinter } from "api/printer"; // Assumes connectPrinter makes a POST to /printers/connect
import usePrinterStream from "hooks/usePrinterStream";

// Helper function to capitalize the first letter.
const capitalizeStatus = (status) => {
  if (!status || typeof status !== "string") return status;
  return status.charAt(0).toUpperCase() + status.slice(1);
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

  // Local state for connection status.
  const [localStatus, setLocalStatus] = useState(status);
  // Local state for dynamic data.
  const [dynamicData, setDynamicData] = useState({
    progress,
    finish,
    queued,
    extruder,
    heaterBed,
  });

  // Construct the webcam URL.
  const webcamUrl = `http://${ip_address}/webcam/?action=stream`;

  // Handler to connect the printer.
  const handleConnect = () => {
    connectPrinter(ip_address)
      .then((data) => {
        console.log("Connected successfully:", data);
        // Update status based on backend response; assume backend returns printer.status
        setLocalStatus(data.printer.status || "Connected");
      })
      .catch((err) => {
        console.error("Error connecting to printer:", err);
      });
  };

  // Determine whether to start listening via SSE.
  // In this case, if the status is anything other than "idle" (ignoring case), we activate SSE.
  const activateSSE = localStatus && localStatus.toLowerCase() !== "disconnected";

  // Listen for real-time updates via the SSE endpoint once activated.
  usePrinterStream(
    ip_address,
    (data) => {
      console.log("Received SSE data:", data);
      // Check if the response contains a result with a status object.
      if (data && data.result && data.result.status) {
        const statusData = data.result.status;
        setDynamicData((prevData) => ({
          ...prevData,
          extruder: statusData.extruder
            ? `${statusData.extruder.temperature}°C`
            : prevData.extruder,
          heaterBed: statusData.heater_bed
            ? `${statusData.heater_bed.temperature}°C`
            : prevData.heaterBed,
        }));
      }
      // If a top-level status is provided, update connection status.
      if (data.status) {
        setLocalStatus(data.status);
      }
    },
    activateSSE
  );

  return (
    <Card sx={{ maxWidth: 500, m: 2 }}>
      <CardContent>
        {/* Printer Name (centered) */}
        <MDTypography variant="h5" fontWeight="bold" align="center" mt={1} mb={1}>
          {printer_name}
        </MDTypography>

        {/* Responsive Webcam Container */}
        <MDBox
          sx={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%", // 16:9 Aspect Ratio (adjust if needed)
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

        {/* Dynamic Data Grid including Status */}
        <MDBox mt={2} mb={2}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <MDTypography variant="body2">
                <strong>Status:</strong> {capitalizeStatus(localStatus)}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Progress:</strong> {dynamicData.progress}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Queued:</strong> {dynamicData.queued}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              <MDTypography variant="body2">
                <strong>Finish:</strong> {dynamicData.finish}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Extruder:</strong> {dynamicData.extruder}
              </MDTypography>
              <MDTypography variant="body2">
                <strong>Heater Bed:</strong> {dynamicData.heaterBed}
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        {/* Action Buttons */}
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
