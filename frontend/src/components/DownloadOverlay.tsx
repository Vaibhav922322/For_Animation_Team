import { type CSSProperties } from "react";
import Lottie from "lottie-react";
import catLoader from "../assets/Loader cat.json";

interface DownloadOverlayProps {
  isVisible: boolean;
  fileName?: string;
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

const textStyles: CSSProperties = {
  color: "#e2e8f0",
  fontSize: "1.1rem",
  fontWeight: 500,
  margin: 0,
  textAlign: "center",
};

const fileNameStyles: CSSProperties = {
  color: "#94a3b8",
  fontSize: "0.85rem",
  fontWeight: 400,
  margin: 0,
  textAlign: "center",
  maxWidth: "300px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// =============================================================================
// Component
// =============================================================================
const DownloadOverlay = ({ isVisible, fileName }: DownloadOverlayProps) => {
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
