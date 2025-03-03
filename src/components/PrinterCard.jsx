import React, { useState } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { connectPrinter } from "api/printer";
import usePrinterStream from "hooks/usePrinterStream";

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
  // Local state for dynamic data from SSE.
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
        console.log("Connected successfully: ", data);
        setLocalStatus("Connected");
      })
      .catch((err) => {
        console.error("Error connecting to printer: ", err);
      });
  };

  // Use the custom hook to listen to the SSE stream when connected.
  // We use the printer's IP address as the stream key.
  usePrinterStream(
    ip_address,
    (data) => {
      setDynamicData((prevData) => ({ ...prevData, ...data }));
      if (data.status) {
        setLocalStatus(data.status);
      }
    },
    localStatus === "Connected"
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
            paddingTop: "56.25%", // 16:9 Aspect Ratio
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
                <strong>Status:</strong> {localStatus}
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
