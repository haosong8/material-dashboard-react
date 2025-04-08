// src/components/DynamicIframe.jsx
import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

const DynamicIframe = ({
  src,
  baseWidth,
  baseHeight,
  containerWidth,
  containerHeight,
  scalingFactor,
  alignTop,
}) => {
  const containerRef = useRef(null);
  const [uniformScale, setUniformScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = containerWidth / baseWidth;
      const scaleY = containerHeight / baseHeight;
      const scale = Math.min(scaleX, scaleY) * scalingFactor;
      setUniformScale(scale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [baseWidth, baseHeight, containerWidth, containerHeight, scalingFactor]);

  // If alignTop is true, position the content so its top edge is visible.
  const transformStyle = alignTop
    ? `translate(-50%, 0) scale(${uniformScale})`
    : `translate(-50%, -50%) scale(${uniformScale})`;
  const transformOrigin = alignTop ? "top center" : "center center";
  // When alignTop is true, set top to 0; otherwise, 50%.
  const topPosition = alignTop ? 0 : "50%";

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: containerWidth,
        height: containerHeight,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: topPosition,
          left: "50%",
          transform: transformStyle,
          transformOrigin: transformOrigin,
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
        }}
      >
        <iframe
          src={src}
          title="Dynamic Video Feed"
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

DynamicIframe.propTypes = {
  src: PropTypes.string.isRequired,
  baseWidth: PropTypes.number.isRequired,
  baseHeight: PropTypes.number.isRequired,
  containerWidth: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired,
  scalingFactor: PropTypes.number,
  alignTop: PropTypes.bool,
};

DynamicIframe.defaultProps = {
  scalingFactor: 1,
  alignTop: false,
};

export default DynamicIframe;
