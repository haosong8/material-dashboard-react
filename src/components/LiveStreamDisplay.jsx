// src/components/LiveStreamDisplay.jsx
import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import CardMedia from "@mui/material/CardMedia";
import ResponsiveDynamicIframe from "./ResponsiveDynamicIframe";

const LiveStreamDisplay = ({
  webcamUrl,
  useDynamicIframe,
  useIframe,
  baseWidth,
  baseHeight,
  scalingFactor,
  alignTop,
}) => {
  if (useDynamicIframe) {
    return (
      <ResponsiveDynamicIframe
        src={webcamUrl}
        baseWidth={baseWidth}
        baseHeight={baseHeight}
        scalingFactor={scalingFactor}
        alignTop={alignTop}
      />
    );
  } else if (useIframe) {
    return (
      <MDBox
        sx={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <iframe
          src={webcamUrl}
          title="Live Stream"
          scrolling="no"
          style={{ border: "none", width: "100%", height: "100%" }}
        />
      </MDBox>
    );
  } else {
    return (
      <MDBox
        sx={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <CardMedia
          component="img"
          image={webcamUrl}
          alt="Live Stream"
          sx={{ width: "92%", height: "90%", objectFit: "cover", objectPosition: "center" }}
        />
      </MDBox>
    );
  }
};

LiveStreamDisplay.propTypes = {
  webcamUrl: PropTypes.string.isRequired,
  useDynamicIframe: PropTypes.bool,
  useIframe: PropTypes.bool,
  baseWidth: PropTypes.number.isRequired,
  baseHeight: PropTypes.number.isRequired,
  scalingFactor: PropTypes.number,
  alignTop: PropTypes.bool,
};

LiveStreamDisplay.defaultProps = {
  useDynamicIframe: false,
  useIframe: false,
  baseWidth: 1920,
  baseHeight: 1080,
  scalingFactor: 1,
  alignTop: false,
};

export default LiveStreamDisplay;
