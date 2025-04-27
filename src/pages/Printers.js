// src/pages/Printers.jsx
import React, { useState, useEffect } from "react";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PrinterCard from "components/PrinterCard";
import { fetchPrinters, connectPrinter } from "api/printer";

const Printers = () => {
  const [printers, setPrinters] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [showOffline, setShowOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectingAll, setConnectingAll] = useState(false);

  // Load printers
  const loadPrinters = async () => {
    try {
      const data = await fetchPrinters();
      setPrinters(data);
    } catch (err) {
      setError(err.message || "Failed to fetch printers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  // Connect all printers, then reload
  const handleConnectAll = async () => {
    setConnectingAll(true);
    try {
      await Promise.all(printers.map((p) => connectPrinter(p.ip_address)));
      await loadPrinters();
    } catch (err) {
      console.error("Error connecting all printers:", err);
      setError("Failed to connect all printers");
    } finally {
      setConnectingAll(false);
    }
  };

  const handleViewChange = (e, next) => {
    if (next) setViewMode(next);
  };

  const displayedPrinters = showOffline
    ? printers
    : printers.filter((p) => p.status && p.status.toLowerCase() !== "offline");

  if (loading) {
    return (
      <DashboardLayout>
        <MDBox py={3} display="flex" justifyContent="center">
          <h6>Loading...</h6>
        </MDBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <MDBox py={3} display="flex" justifyContent="center">
          <h6 style={{ color: "red" }}>{error}</h6>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Connect All */}
        <MDBox display="flex" justifyContent="center" mb={2}>
          <Button
            variant="contained"
            color="info"
            onClick={handleConnectAll}
            disabled={connectingAll}
          >
            {connectingAll ? "Connecting..." : "Connect All"}
          </Button>
        </MDBox>

        {/* View & Filter toggles */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <FormControlLabel
            control={
              <Switch
                checked={showOffline}
                onChange={(e) => setShowOffline(e.target.checked)}
                color="primary"
              />
            }
            label="Show Offline"
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
          >
            <ToggleButton value="grid" aria-label="grid view">
              Grid
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              Table
            </ToggleButton>
          </ToggleButtonGroup>
        </MDBox>

        {viewMode === "grid" ? (
          <Grid container spacing={3}>
            {displayedPrinters.map((printer) => (
              <Grid item xs={12} sm={6} md={4} key={printer.printer_id}>
                <PrinterCard printer={printer} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedPrinters.map((printer) => (
                  <TableRow key={printer.printer_id}>
                    <TableCell>{printer.printer_name || "N/A"}</TableCell>
                    <TableCell>{printer.printer_model || "N/A"}</TableCell>
                    <TableCell>{printer.status}</TableCell>
                    <TableCell>{printer.location || "Not specified"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MDBox>
    </DashboardLayout>
  );
};

export default Printers;
