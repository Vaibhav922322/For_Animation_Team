import { type CSSProperties } from "react";
import { Download, FileBox, Image, Film, File } from "lucide-react";

// =============================================================================
// Types
// =============================================================================
export interface Asset {
  id: string;
  name: string;
  type: "model" | "texture" | "animation" | "other";
  thumbnail?: string;
  size?: string;
  date?: string;
  host_ip?: string;
  shared_folder_name?: string;
  file_path?: string;
}

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
  onDownload: (e: React.MouseEvent) => void;
}

// =============================================================================
// File Type Icons
// =============================================================================
const getFileIcon = (type: Asset["type"]) => {
  switch (type) {
    case "model":
      return <FileBox size={24} />;
    case "texture":
      return <Image size={24} />;
    case "animation":
      return <Film size={24} />;
    default:
      return <File size={24} />;
  }
};

const getTypeColor = (type: Asset["type"]) => {
  switch (type) {
    case "model":
      return "#8b5cf6"; // purple
    case "texture":
      return "#10b981"; // green
    case "animation":
      return "#f59e0b"; // amber
    default:
      return "#6b7280"; // gray
  }
};

const getTypeBgColor = (type: Asset["type"]) => {
  switch (type) {
    case "model":
      return "#f3e8ff";
    case "texture":
      return "#d1fae5";
    case "animation":
      return "#fef3c7";
    default:
      return "#f3f4f6";
  }
};

// =============================================================================
// Styles
// =============================================================================
const cardStyles: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#e5e7eb",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
};

const thumbnailContainerStyles: CSSProperties = {
  height: "140px",
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
};

const thumbnailStyles: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const placeholderStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  color: "#9ca3af",
};

const contentStyles: CSSProperties = {
  padding: "16px",
};

const headerStyles: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
};

const nameStyles: CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#1e293b",
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1,
};

const downloadButtonStyles: CSSProperties = {
  padding: "8px",
  borderRadius: "8px",
  backgroundColor: "#f1f5f9",
  borderWidth: 0,
  borderStyle: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  transition: "all 0.15s ease",
  flexShrink: 0,
};

const metaStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "12px",
};

const typeTagStyles = (type: Asset["type"]): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: getTypeBgColor(type),
  color: getTypeColor(type),
});

const sizeStyles: CSSProperties = {
  fontSize: "0.75rem",
  color: "#9ca3af",
};

// =============================================================================
// Component
// =============================================================================
const AssetCard = ({ asset, onClick, onDownload }: AssetCardProps) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(e);
  };

  return (
    <div
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.1)";
        e.currentTarget.style.borderColor = "#3b82f6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
        e.currentTarget.style.borderColor = "#e5e7eb";
      }}
    >
      {/* Thumbnail */}
      <div style={thumbnailContainerStyles}>
        {asset.thumbnail ? (
          <img src={asset.thumbnail} alt={asset.name} style={thumbnailStyles} />
        ) : (
          <div style={placeholderStyles}>
            <div style={{ color: getTypeColor(asset.type) }}>
              {getFileIcon(asset.type)}
            </div>
            <span style={{ fontSize: "0.75rem" }}>No Preview</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={contentStyles}>
        <div style={headerStyles}>
          <p style={nameStyles} title={asset.name}>
            {asset.name}
          </p>
          <button
            style={downloadButtonStyles}
            onClick={handleDownloadClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3b82f6";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.color = "#64748b";
            }}
            title="Download"
          >
            <Download size={16} />
          </button>
        </div>

        <div style={metaStyles}>
          <span style={typeTagStyles(asset.type)}>
            {getFileIcon(asset.type)}
            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
          </span>
          {asset.size && <span style={sizeStyles}>{asset.size}</span>}
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
