import { type CSSProperties } from "react";
import Lottie from "lottie-react";
import catLoader from "../assets/Loader cat.json";

interface DownloadOverlayProps {
  isVisible: boolean;
  progress?: number; // 0-100 or -1 for indeterminate
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
  gap: "8px",
  padding: "40px 48px",
};

const lottieStyles: CSSProperties = {
  width: "400px",
  height: "400px",
};

const progressTextStyles: CSSProperties = {
  color: "#1e293b",
  fontSize: "1.2rem",
  fontWeight: 600,
  margin: 0,
  textAlign: "center",
};

const progressBarContainerStyles: CSSProperties = {
  width: "200px",
  height: "6px",
  borderRadius: "3px",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
};

const progressBarFillStyles = (percent: number): CSSProperties => ({
  height: "100%",
  borderRadius: "3px",
  backgroundColor: "#6366f1",
  width: `${percent}%`,
  transition: "width 0.3s ease",
});

// =============================================================================
// Component
// =============================================================================
const DownloadOverlay = ({ isVisible, progress = -1 }: DownloadOverlayProps) => {
  if (!isVisible) return null;

  const showProgress = progress >= 0 && progress <= 100;

  return (
    <div style={overlayStyles}>
      <div style={cardStyles}>
        <Lottie animationData={catLoader} loop style={lottieStyles} />
        {showProgress ? (
          <>
            <p style={progressTextStyles}>{progress}%</p>
            <div style={progressBarContainerStyles}>
              <div style={progressBarFillStyles(progress)} />
            </div>
          </>
        ) : (
          <p style={{ ...progressTextStyles, fontSize: "0.9rem", color: "#64748b" }}>
            Downloading...
          </p>
        )}
      </div>
    </div>
  );
};

export default DownloadOverlay;
