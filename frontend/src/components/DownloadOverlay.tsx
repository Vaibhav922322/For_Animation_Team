import { type CSSProperties } from "react";
import Lottie from "lottie-react";
import catLoader from "../assets/Loader cat.json";

interface DownloadOverlayProps {
  isVisible: boolean;
}

// =============================================================================
// Styles
// =============================================================================
const overlayStyles: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  zIndex: 9999,
};

const cardStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  padding: "40px 48px",
};

const lottieStyles: CSSProperties = {
  width: "400px",
  height: "400px",
};

// =============================================================================
// Component
// =============================================================================
const DownloadOverlay = ({ isVisible }: DownloadOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div style={overlayStyles}>
      <div style={cardStyles}>
        <Lottie animationData={catLoader} loop style={lottieStyles} />
      </div>
    </div>
  );
};

export default DownloadOverlay;
