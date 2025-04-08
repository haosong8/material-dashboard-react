// src/components/ResponsiveDynamicIframe.jsx
import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

const ResponsiveDynamicIframe = ({ src, baseWidth, baseHeight, scalingFactor }) => {
  const containerRef = useRef(null);
  const [measuredWidth, setMeasuredWidth] = useState(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setMeasuredWidth(containerRef.current.offsetWidth);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Until we have a measured width, render an empty container.
  if (!measuredWidth) {
    return <div ref={containerRef} style={{ width: "100%" }} />;
  }

  // Compute container height based on aspect ratio.
  const containerHeight = measuredWidth * (baseHeight / baseWidth);
  // Compute the uniform scale factor so that the native width is scaled to measured width, then apply any additional factor.
  const uniformScale = (measuredWidth / baseWidth) * scalingFactor;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: containerHeight,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${uniformScale})`,
          transformOrigin: "50% 55%",
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
        }}
      >
        <iframe
          src={src}
          title="Responsive Video Feed"
          scrolling="no"
          style={{
            border: "none",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
};

ResponsiveDynamicIframe.propTypes = {
  src: PropTypes.string.isRequired,
  baseWidth: PropTypes.number.isRequired,
  baseHeight: PropTypes.number.isRequired,
  scalingFactor: PropTypes.number,
};

ResponsiveDynamicIframe.defaultProps = {
  scalingFactor: 1,
};

export default ResponsiveDynamicIframe;
