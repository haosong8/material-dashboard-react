// src/components/LiveStreamDisplay.jsx
import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import CardMedia from "@mui/material/CardMedia";
import ResponsiveDynamicIframe from "./ResponsiveDynamicIframe";
import RtcVideoFeed from "./RtcVideoFeed";

const LiveStreamDisplay = ({
  webcamUrl,
  useRTC,
  useDynamicIframe,
  useIframe,
  baseWidth,
  baseHeight,
  scalingFactor,
  alignTop,
  printerIp,
}) => {
  // If the RTC flag is set, render the RTC component.
  if (useRTC) {
    return <RtcVideoFeed printerIp={printerIp} />;
  } else if (useDynamicIframe) {
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
  useRTC: PropTypes.bool,
  useDynamicIframe: PropTypes.bool,
  useIframe: PropTypes.bool,
  baseWidth: PropTypes.number.isRequired,
  baseHeight: PropTypes.number.isRequired,
  scalingFactor: PropTypes.number,
  alignTop: PropTypes.bool,
  printerIp: PropTypes.string,
};

LiveStreamDisplay.defaultProps = {
  useRTC: false,
  useDynamicIframe: false,
  useIframe: false,
  baseWidth: 1920,
  baseHeight: 1080,
  scalingFactor: 1,
  alignTop: false,
  printerIp: "",
};

export default LiveStreamDisplay;
