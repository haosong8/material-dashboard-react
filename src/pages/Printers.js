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
} from "@mui/material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PrinterCard from "components/PrinterCard";
import { fetchPrinters, connectPrinter } from "api/printer";

const Printers = () => {
  const [printers, setPrinters] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial fetch to load printers data.
  useEffect(() => {
    fetchPrinters()
      .then((data) => {
        setPrinters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Handler for "Connect All" button.
  const handleConnectAll = async () => {
    try {
      // Initiate connection for each printer concurrently.
      await Promise.all(printers.map((printer) => connectPrinter(printer.ip_address)));
      // Re-fetch printers to update their statuses from the API.
      const updatedPrinters = await fetchPrinters();
      // Force re-render by setting a new array instance.
      setPrinters([...updatedPrinters]);
    } catch (error) {
      console.error("Error connecting all printers:", error);
    }
  };

  const handleViewChange = (event, nextView) => {
    if (nextView !== null) {
      setViewMode(nextView);
    }
  };

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
        {/* Connect All Button */}
        <MDBox display="flex" justifyContent="center" mb={2}>
          <Button variant="contained" color="info" onClick={handleConnectAll}>
            Connect All
          </Button>
        </MDBox>
        <MDBox display="flex" justifyContent="flex-end" mb={2}>
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
            {printers.map((printer, index) => (
              <Grid item xs={12} sm={6} md={4} key={`${printer.printer_id}-${printer.status}`}>
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
                {printers.map((printer, index) => (
                  <TableRow key={`${printer.printer_id}-${printer.status}`}>
                    <TableCell>{printer.printer_name || "N/A"}</TableCell>
                    <TableCell>{printer.printer_model || "N/A"}</TableCell>
                    <TableCell>{printer.status || "Unknown"}</TableCell>
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
