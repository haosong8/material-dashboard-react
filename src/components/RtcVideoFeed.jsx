// src/components/RtcVideoFeed.jsx
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const RtcVideoFeed = ({ printerIp, signalingUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Construct the signaling URL using the printerIp if no explicit signalingUrl was provided.
    const url = signalingUrl || (printerIp ? `http://${printerIp}:8000/call/webrtc_local` : null);
    if (!url) {
      console.error("No signaling URL or printer IP provided for RTC video feed");
      return;
    }

    // Use a default RTCPeerConnection config on non-Android devices.
    const isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    const pc = isAndroid
      ? new RTCPeerConnection()
      : new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

    const log = (msg) => console.log(msg);

    const sendOfferToCall = (sdp) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try {
            const res = JSON.parse(atob(xhr.responseText));
            console.log("Received answer:", res);
            if (res.type === "answer") {
              pc.setRemoteDescription(new RTCSessionDescription(res));
            }
          } catch (e) {
            console.error("Error parsing response:", e);
          }
        }
      };
      xhr.open("POST", url);
      xhr.setRequestHeader("Content-Type", "plain/text");
      const payload = btoa(JSON.stringify({ type: "offer", sdp }));
      xhr.send(payload);
    };

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.autoplay = true;
        videoRef.current.controls = false;
        videoRef.current.muted = true;
      }
    };

    pc.oniceconnectionstatechange = () => {
      log("ICE connection state: " + pc.iceConnectionState);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate === null) {
        sendOfferToCall(pc.localDescription.sdp);
      }
    };

    // Add a transceiver so the connection both sends and receives video.
    pc.addTransceiver("video", { direction: "sendrecv" });

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch((err) => console.error("Error creating offer:", err));

    return () => {
      pc.close();
    };
  }, [printerIp, signalingUrl]);

  return (
    <video
      ref={videoRef}
      style={{ width: "100%", height: "100%", objectFit: "fill" }}
      playsInline
      autoPlay
      muted
    />
  );
};

RtcVideoFeed.propTypes = {
  printerIp: PropTypes.string.isRequired,
  signalingUrl: PropTypes.string,
};

export default RtcVideoFeed;
