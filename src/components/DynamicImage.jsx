// src/components/DynamicImage.jsx
import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

const DynamicImage = ({
  src,
  baseWidth,
  baseHeight,
  containerWidth,
  containerHeight,
  scalingFactor,
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

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: containerWidth,
        height: containerHeight,
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${uniformScale})`,
          transformOrigin: "center center",
        }}
      >
        <img
          src={src}
          alt="Dynamic Live Stream"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
    </div>
  );
};

DynamicImage.propTypes = {
  src: PropTypes.string.isRequired,
  baseWidth: PropTypes.number.isRequired,
  baseHeight: PropTypes.number.isRequired,
  containerWidth: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired,
  scalingFactor: PropTypes.number,
};

DynamicImage.defaultProps = {
  scalingFactor: 1,
};

export default DynamicImage;
