// src/pages/PrinterDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Grid, Table, TableContainer, TableRow, Paper } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import LiveStreamDisplay from "components/LiveStreamDisplay";
import PrinterDynamicData from "components/PrinterDynamicData";
import { getPrinterbyIP } from "api/printer";
import { fetchGcodes } from "api/gcode";
import { capitalizeStatus } from "utils/helpers";
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";

const PrinterDetailsPage = () => {
  const { ipAddress } = useParams();
  const [printer, setPrinter] = useState(null);
  const [loadingGcodes, setLoadingGcodes] = useState(false);

  // Fetch printer details on mount
  const loadPrinter = async () => {
    try {
      const data = await getPrinterbyIP(ipAddress);
      setPrinter(data);
    } catch (err) {
      console.error("Error fetching printer details:", err);
    }
  };

  useEffect(() => {
    loadPrinter();
  }, [ipAddress]);

  // Handler to refresh Gcodes and update printer state
  const handleRefresh = async () => {
    setLoadingGcodes(true);
    try {
      await fetchGcodes(ipAddress);
      await loadPrinter();
    } catch (err) {
      console.error("Error refreshing Gcodes:", err);
    } finally {
      setLoadingGcodes(false);
    }
  };

  if (!printer) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} display="flex" justifyContent="center">
          <MDTypography variant="h6">Loading printer details…</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  const {
    printer_name,
    webcam_address,
    webcam_port,
    camera_resolution_width,
    camera_resolution_height,
    camera_scaling_factor,
    status,
    gcodes,
    port,
    printer_model,
    available_start_time,
    available_end_time,
    prepare_time,
    supported_materials,
    heated_chamber,
    progress,
    finish,
    queued,
    extruder,
    heaterBed,
    chamberTemp,
    filename,
    filamentUsed,
    layer,
  } = printer;

  const webcamUrl =
    webcam_address && webcam_port
      ? `http://${ipAddress}:${webcam_port}${webcam_address}`
      : `http://${ipAddress}/webcam/?action=stream`;
  const useRTC = webcam_address && Number(webcam_port) === 8000;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={3} display="flex" justifyContent="center">
          <MDTypography variant="h4">
            {printer_name} ({ipAddress})
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          {/* Live Stream */}
          <Grid item xs={12} md={6}>
            <LiveStreamDisplay
              webcamUrl={webcamUrl}
              useRTC={useRTC}
              useDynamicIframe={false}
              useIframe={false}
              containerWidth={600}
              containerHeight={500}
              baseWidth={Number(camera_resolution_width) || 1920}
              baseHeight={Number(camera_resolution_height) || 1080}
              scalingFactor={Number(camera_scaling_factor) || 1}
              printerIp={ipAddress}
            />
          </Grid>

          {/* Static Info */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <MDTypography variant="h6" gutterBottom>
                Printer Information (Static)
              </MDTypography>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                <li>
                  <strong>Name:</strong> {printer_name}
                </li>
                <li>
                  <strong>Model:</strong> {printer_model}
                </li>
                <li>
                  <strong>IP Address:</strong> {ipAddress}
                </li>
                <li>
                  <strong>Port:</strong> {port}
                </li>
                <li>
                  <strong>Available Time:</strong> {available_start_time || "N/A"} –{" "}
                  {available_end_time || "N/A"}
                </li>
                <li>
                  <strong>Prepare Time:</strong> {prepare_time || "N/A"}
                </li>
                <li>
                  <strong>Supported Materials:</strong> {supported_materials?.join(", ") || "N/A"}
                </li>
                <li>
                  <strong>Heated Chamber:</strong> {heated_chamber ? "Yes" : "No"}
                </li>
                <li>
                  <strong>Status:</strong> {capitalizeStatus(status)}
                </li>
              </ul>
            </Paper>
          </Grid>

          {/* Realtime Info Grid */}
          <Grid item xs={12}>
            <PrinterDynamicData
              ipAddress={ipAddress}
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
                  <Paper sx={{ p: 2 }}>
                    <MDTypography variant="h6" gutterBottom>
                      Realtime Print Information
                    </MDTypography>
                    <MDBox mb={1}>
                      {dynamicData.filename && (
                        <MDTypography variant="body2">
                          <strong>File:</strong> {dynamicData.filename}
                        </MDTypography>
                      )}
                    </MDBox>
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
                            <MDTypography variant="body2">
                              <strong>Filament:</strong> {dynamicData.filamentUsed}
                            </MDTypography>
                            <MDTypography variant="body2">
                              <strong>Layer:</strong> {dynamicData.layer}
                            </MDTypography>
                          </>
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
                    <MDButton
                      variant="contained"
                      color="info"
                      onClick={handleConnect}
                      sx={{ mt: 2 }}
                    >
                      Connect
                    </MDButton>
                  </Paper>
                );
              }}
            </PrinterDynamicData>
          </Grid>

          {/* Gcode Files */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <MDTypography variant="h6" gutterBottom>
                Associated Gcode Files
              </MDTypography>
              <MDButton
                variant="contained"
                color="primary"
                onClick={handleRefresh}
                disabled={loadingGcodes}
                sx={{ mb: 2 }}
              >
                {loadingGcodes ? "Refreshing..." : "Refresh Gcodes"}
              </MDButton>
              {gcodes?.length > 0 ? (
                <TableContainer sx={{ maxHeight: 400, minWidth: 650, overflow: "auto" }}>
                  <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
                    <thead>
                      <TableRow>
                        <DataTableHeadCell align="center">Filename</DataTableHeadCell>
                        <DataTableHeadCell align="center">Material</DataTableHeadCell>
                        <DataTableHeadCell align="center">Estimated Print Time</DataTableHeadCell>
                        <DataTableHeadCell align="center">Historical Print Time</DataTableHeadCell>
                      </TableRow>
                    </thead>
                    <tbody>
                      {gcodes.map((g) => (
                        <TableRow key={g.gcode_id}>
                          <DataTableBodyCell align="center">{g.gcode_name}</DataTableBodyCell>
                          <DataTableBodyCell align="center">{g.material}</DataTableBodyCell>
                          <DataTableBodyCell align="center">
                            {g.estimated_print_time}
                          </DataTableBodyCell>
                          <DataTableBodyCell align="center">
                            {g.historical_print_time}
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

        {/* Back Button */}
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
