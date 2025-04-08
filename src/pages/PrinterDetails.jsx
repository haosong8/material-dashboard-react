// src/pages/PrinterDetailsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, Grid, Table, TableContainer, Paper, TableRow } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CardMedia from "@mui/material/CardMedia";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import usePrinterSocket from "hooks/usePrinterSocket";
import { getPrinterbyIP } from "api/printer";
import { fetchGcodes } from "api/gcode";
import { capitalizeStatus, formatSecondsToHHMMSS } from "utils/helpers";
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";
import LiveStreamDisplay from "components/LiveStreamDisplay";

const PrinterDetailsPage = () => {
  const { ipAddress } = useParams();
  const [printer, setPrinter] = useState(null);
  const [socketData, setSocketData] = useState(null);
  const [eta, setEta] = useState(null);

  // Fetch static printer details (including associated gcodes)
  useEffect(() => {
    getPrinterbyIP(ipAddress)
      .then((data) => {
        setPrinter(data);
      })
      .catch((err) => {
        console.error("Error fetching printer details:", err);
      });
  }, [ipAddress]);

  // Realtime socket update handler.
  const handleSocketData = useCallback((data) => {
    setSocketData(data);
    if (
      data &&
      data.result &&
      data.result.status &&
      data.result.status.toolhead &&
      data.result.status.print_stats &&
      data.result.status.print_stats.print_duration !== undefined &&
      data.result.status.print_stats.state === "printing"
    ) {
      const est = data.result.status.toolhead.estimated_print_time;
      const current = data.result.status.print_stats.print_duration;
      const remaining = Math.max(0, est - current);
      setEta(formatSecondsToHHMMSS(remaining));
    }
  }, []);

  // Activate socket if printer is connected.
  usePrinterSocket(
    ipAddress,
    handleSocketData,
    printer ? printer.status.toLowerCase() !== "disconnected" : false
  );

  if (!printer) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} display="flex" justifyContent="center">
          <MDTypography variant="h6">Loading printer details...</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  // Build the webcam URL.
  const webcamUrl =
    printer.webcam_address && printer.webcam_port
      ? `http://${printer.ip_address}:${printer.webcam_port}${printer.webcam_address}`
      : `http://${printer.ip_address}/webcam/?action=stream`;

  // Determine if we should use dynamic scaling for the live stream.
  const useDynamicIframe =
    printer.webcam_address &&
    (printer.webcam_address.includes(".html") || Number(printer.webcam_port) === 8000);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} display="flex" justifyContent="center">
          <MDTypography variant="h4">
            {printer.printer_name} ({printer.ip_address})
          </MDTypography>
        </MDBox>
        <Grid container spacing={3}>
          {/* Camera Feed using LiveStreamDisplay */}
          <Grid item xs={12} md={6}>
            <LiveStreamDisplay
              webcamUrl={webcamUrl}
              useDynamicIframe={useDynamicIframe}
              // Fixed container dimensions for details page:
              containerWidth={600} // Adjust as needed (or use responsive approach)
              containerHeight={500} // Adjust as needed
              baseWidth={Number(printer.camera_resolution_width) || 1920}
              baseHeight={Number(printer.camera_resolution_height) || 1080}
              scalingFactor={Number(printer.camera_scaling_factor) || 1}
            />
          </Grid>
          {/* Static Printer Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <MDTypography variant="h6" gutterBottom>
                Printer Information (Static)
              </MDTypography>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                <li>
                  <strong>Name:</strong> {printer.printer_name}
                </li>
                <li>
                  <strong>Model:</strong> {printer.printer_model}
                </li>
                <li>
                  <strong>IP Address:</strong> {printer.ip_address}
                </li>
                <li>
                  <strong>Port:</strong> {printer.port}
                </li>
                <li>
                  <strong>Available Time:</strong> {printer.available_start_time} -{" "}
                  {printer.available_end_time}
                </li>
                <li>
                  <strong>Prepare Time:</strong> {printer.prepare_time || "N/A"}
                </li>
                <li>
                  <strong>Supported Materials:</strong>{" "}
                  {printer.supported_materials && printer.supported_materials.join(", ")}
                </li>
                <li>
                  <strong>Status:</strong> {capitalizeStatus(printer.status)}
                </li>
              </ul>
            </Paper>
          </Grid>
          {/* Realtime Print Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <MDTypography variant="h6" gutterBottom>
                Realtime Print Information
              </MDTypography>
              {socketData && socketData.result && socketData.result.status ? (
                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                  {socketData.result.status.extruder && (
                    <li>
                      <strong>Extruder Temp:</strong>{" "}
                      {socketData.result.status.extruder.temperature}°C
                    </li>
                  )}
                  {socketData.result.status.heater_bed && (
                    <li>
                      <strong>Heater Bed Temp:</strong>{" "}
                      {socketData.result.status.heater_bed.temperature}°C
                    </li>
                  )}
                  {socketData.result.status.print_stats && (
                    <li>
                      <strong>Print State:</strong>{" "}
                      {capitalizeStatus(socketData.result.status.print_stats.state)}
                    </li>
                  )}
                  {eta && (
                    <li>
                      <strong>ETA:</strong> {eta}
                    </li>
                  )}
                </ul>
              ) : (
                <p>No realtime data available.</p>
              )}
            </Paper>
          </Grid>
          {/* Associated Gcode Files using custom DataTable components */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <MDTypography variant="h6" gutterBottom>
                Associated Gcode Files
              </MDTypography>
              <MDButton
                variant="contained"
                color="primary"
                onClick={() =>
                  fetchGcodes(printer.ip_address)
                    .then(() => {
                      // Optionally refresh printer details after updating gcodes.
                    })
                    .catch((err) => console.error("Error refreshing gcodes:", err))
                }
              >
                Refresh Gcodes
              </MDButton>
              {printer.gcodes && printer.gcodes.length > 0 ? (
                <TableContainer
                  sx={{
                    maxHeight: 400,
                    minWidth: 650,
                    overflow: "auto",
                  }}
                >
                  <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
                    <thead>
                      <TableRow>
                        <DataTableHeadCell width="40%" align="center">
                          Filename
                        </DataTableHeadCell>
                        <DataTableHeadCell width="15%" align="center">
                          Material
                        </DataTableHeadCell>
                        <DataTableHeadCell width="20%" align="center">
                          Estimated Print Time
                        </DataTableHeadCell>
                        <DataTableHeadCell width="20%" align="center">
                          Historical Print Time
                        </DataTableHeadCell>
                      </TableRow>
                    </thead>
                    <tbody>
                      {printer.gcodes.map((g) => (
                        <TableRow key={g.gcode_id}>
                          <DataTableBodyCell align="center">
                            {g.gcode_name || "unknown"}
                          </DataTableBodyCell>
                          <DataTableBodyCell align="center">
                            {g.material || "unknown"}
                          </DataTableBodyCell>
                          <DataTableBodyCell align="center">
                            {g.estimated_print_time || "N/A"}
                          </DataTableBodyCell>
                          <DataTableBodyCell align="center">
                            {g.historical_print_time || "N/A"}
                          </DataTableBodyCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </TableContainer>
              ) : (
                <p>No Gcode files associated with this printer.</p>
              )}
            </Paper>
          </Grid>
        </Grid>
        <MDBox mt={3} display="flex" justifyContent="center">
          <MDButton variant="contained" color="secondary" component={Link} to="/printers">
            Back to Printers
          </MDButton>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

export default PrinterDetailsPage;
