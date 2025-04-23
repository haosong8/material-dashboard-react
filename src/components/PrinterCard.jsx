// src/components/PrinterCard.jsx
import React from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Link } from "react-router-dom";
import { capitalizeStatus } from "utils/helpers";
import LiveStreamDisplay from "components/LiveStreamDisplay";
import PrinterDynamicData from "components/PrinterDynamicData";

const PrinterCard = ({ printer }) => {
  const {
    printer_name = "Unnamed Printer",
    ip_address = "0.0.0.0",
    webcam_address,
    webcam_port,
    camera_resolution_width,
    camera_resolution_height,
    camera_scaling_factor,
    progress,
    finish,
    queued,
    extruder,
    heaterBed,
    chamberTemp,
    filename,
    filamentUsed,
    layer,
    status,
    heated_chamber,
  } = printer;

  const webcamUrl =
    webcam_address && webcam_port
      ? `http://${ip_address}:${webcam_port}${webcam_address}`
      : `http://${ip_address}/webcam/?action=stream`;
  const useDynamicIframe = webcam_address && webcam_address.includes(".html");
  const useRTC = webcam_address && webcam_port == "8000";

  return (
    <PrinterDynamicData
      ipAddress={ip_address}
      initialStatus={status}
      initialDynamicData={{
        progress: progress || "0%",
        finish: finish || "N/A",
        queued: queued || "0",
        extruder: extruder || "N/A",
        heaterBed: heaterBed || "N/A",
        chamberTemp: chamberTemp || "N/A",
        filename: filename || "",
        filamentUsed: filamentUsed || "N/A",
        layer: layer || "N/A",
      }}
    >
      {({ localStatus, dynamicData, eta, handleConnect }) => {
        const isPrinting = localStatus.toLowerCase() === "printing";
        return (
          <Card sx={{ maxWidth: 500, m: 2, cursor: "default" }}>
            <CardContent>
              {/* Title */}
              <MDBox mb={2} textAlign="center">
                <MDTypography variant="h5" fontWeight="bold">
                  <Link
                    to={`/printers/${ip_address}/details`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {printer_name}
                  </Link>
                </MDTypography>
              </MDBox>

              {/* Live stream */}
              <MDBox mb={2}>
                <LiveStreamDisplay
                  webcamUrl={webcamUrl}
                  useRTC={useRTC}
                  useDynamicIframe={useDynamicIframe}
                  containerWidth={500}
                  containerHeight={300}
                  baseWidth={Number(camera_resolution_width) || 1920}
                  baseHeight={Number(camera_resolution_height) || 1080}
                  scalingFactor={Number(camera_scaling_factor) || 1}
                  printerIp={ip_address}
                />
              </MDBox>

              {/* Filename */}
              {dynamicData.filename && (
                <MDBox mb={2}>
                  <MDTypography variant="body2">
                    <strong>File:</strong> {dynamicData.filename}
                  </MDTypography>
                </MDBox>
              )}
              {/* Dynamic stats grid */}
              <MDBox mt={2} mb={2}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <MDTypography variant="body2">
                      <strong>Status:</strong> {capitalizeStatus(localStatus)}
                    </MDTypography>
                    {isPrinting && (
                      <>
                        <MDTypography variant="body2">
                          <strong>Progress:</strong> {dynamicData.progress}
                        </MDTypography>
                      </>
                    )}
                    {isPrinting && (
                      <MDTypography variant="body2">
                        <strong>Filament:</strong> {dynamicData.filamentUsed}
                      </MDTypography>
                    )}
                    {isPrinting && (
                      <MDTypography variant="body2">
                        <strong>Layer:</strong> {dynamicData.layer}
                      </MDTypography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    {isPrinting && eta && (
                      <MDTypography variant="body2">
                        <strong>ETA:</strong> {eta}
                      </MDTypography>
                    )}
                    {isPrinting && (
                      <MDTypography variant="body2">
                        <strong>Finish:</strong> {dynamicData.finish}
                      </MDTypography>
                    )}
                    <MDTypography variant="body2">
                      <strong>Extruder:</strong> {dynamicData.extruder}
                    </MDTypography>
                    <MDTypography variant="body2">
                      <strong>Heater Bed:</strong> {dynamicData.heaterBed}
                    </MDTypography>
                    {heated_chamber && dynamicData.chamberTemp && (
                      <MDTypography variant="body2">
                        <strong>Chamber:</strong> {dynamicData.chamberTemp}
                      </MDTypography>
                    )}
                  </Grid>
                </Grid>
              </MDBox>

              {/* Action buttons */}
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
      }}
    </PrinterDynamicData>
  );
};

PrinterCard.propTypes = {
  printer: PropTypes.shape({
    printer_id: PropTypes.number.isRequired,
    printer_name: PropTypes.string,
    printer_model: PropTypes.string,
    ip_address: PropTypes.string,
    port: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    progress: PropTypes.string,
    finish: PropTypes.string,
    queued: PropTypes.string,
    extruder: PropTypes.string,
    heaterBed: PropTypes.string,
    chamberTemp: PropTypes.string,
    filename: PropTypes.string,
    filamentUsed: PropTypes.string,
    layer: PropTypes.string,
    webcam_address: PropTypes.string,
    webcam_port: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    camera_resolution_width: PropTypes.number,
    camera_resolution_height: PropTypes.number,
    camera_scaling_factor: PropTypes.number,
    heated_chamber: PropTypes.bool,
  }).isRequired,
};

export default PrinterCard;
