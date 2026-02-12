import { useState, useEffect, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, FileBox, Image, Film, File, Calendar, HardDrive } from "lucide-react";
import type { Asset } from "./AssetCard";

import { previewFile } from "../services/api";

interface AssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (asset: Asset) => void;
}

// =============================================================================
// Helper Functions
// =============================================================================
const getFileIcon = (type: Asset["type"], size: number = 48) => {
  switch (type) {
    case "model":
      return <FileBox size={size} />;
    case "texture":
      return <Image size={size} />;
    case "animation":
      return <Film size={size} />;
    default:
      return <File size={size} />;
  }
};

const getTypeColor = (type: Asset["type"]) => {
  switch (type) {
    case "model":
      return "#8b5cf6";
    case "texture":
      return "#10b981";
    case "animation":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
};

// =============================================================================
// Styles
// =============================================================================
const overlayStyles: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "24px",
};

const modalStyles: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  maxWidth: "600px",
  width: "100%",
  maxHeight: "90vh",
  overflow: "hidden",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
};

const headerStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 24px",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "#e5e7eb",
};

const titleStyles: CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "#1e293b",
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const closeButtonStyles: CSSProperties = {
  padding: "8px",
  borderRadius: "8px",
  backgroundColor: "transparent",
  borderWidth: 0,
  borderStyle: "none",
  cursor: "pointer",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s ease",
};

const previewContainerStyles: CSSProperties = {
  height: "250px",
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const previewImageStyles: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const placeholderStyles = (color: string): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  color: color,
});

const contentStyles: CSSProperties = {
  padding: "24px",
};

const detailsGridStyles: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  marginBottom: "24px",
};

const detailItemStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const detailIconStyles: CSSProperties = {
  width: "40px",
  height: "40px",
  backgroundColor: "#f1f5f9",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
};

const detailTextStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const detailLabelStyles: CSSProperties = {
  fontSize: "0.75rem",
  color: "#9ca3af",
  margin: 0,
};

const detailValueStyles: CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "#1e293b",
  margin: 0,
};

const actionsStyles: CSSProperties = {
  display: "flex",
  gap: "12px",
};

const primaryButtonStyles: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "14px 24px",
  borderRadius: "12px",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#ffffff",
  backgroundColor: "#3b82f6",
  borderWidth: 0,
  borderStyle: "none",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
};

// =============================================================================
// Component
// =============================================================================
const AssetModal = ({ asset, isOpen, onClose, onDownload }: AssetModalProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Fetch preview when asset changes
  useEffect(() => {
    if (isOpen && asset && (asset.type === "texture" || asset.type === "model" || asset.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
      // Only fetch for images/textures or items that look like images
      // Note: 'model' might include thumbnails later, but for now we try if it's an image file
      const isImage = asset.type === "texture" || asset.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      
      if (isImage) {
        setIsLoadingPreview(true);
        const { host_ip, shared_folder_name, file_path } = asset as any;
        
        previewFile(host_ip, shared_folder_name, file_path)
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setIsLoadingPreview(false);
          })
          .catch((err) => {
            console.error("Failed to load preview", err);
            setIsLoadingPreview(false);
          });
      }
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [asset, isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && asset && (
        <motion.div
          style={overlayStyles}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            style={modalStyles}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div style={headerStyles}>
              <h2 style={titleStyles}>{asset.name}</h2>
              <button
                style={closeButtonStyles}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview */}
            <div style={previewContainerStyles}>
              {previewUrl ? (
                <img src={previewUrl} alt={asset.name} style={previewImageStyles} />
              ) : asset.thumbnail ? (
                <img src={asset.thumbnail} alt={asset.name} style={previewImageStyles} />
              ) : (
                <div style={placeholderStyles(getTypeColor(asset.type))}>
                  {isLoadingPreview ? (
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900">Attributes...</div> // Simple loading text or spinner
                  ) : (
                    <>
                      {getFileIcon(asset.type, 64)}
                      <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No Preview Available</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div style={contentStyles}>
              {/* Details Grid */}
              <div style={detailsGridStyles}>
                <div style={detailItemStyles}>
                  <div style={{ ...detailIconStyles, backgroundColor: getTypeColor(asset.type) + "20", color: getTypeColor(asset.type) }}>
                    {getFileIcon(asset.type, 20)}
                  </div>
                  <div style={detailTextStyles}>
                    <p style={detailLabelStyles}>Type</p>
                    <p style={detailValueStyles}>{asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}</p>
                  </div>
                </div>

                <div style={detailItemStyles}>
                  <div style={detailIconStyles}>
                    <HardDrive size={20} />
                  </div>
                  <div style={detailTextStyles}>
                    <p style={detailLabelStyles}>Size</p>
                    <p style={detailValueStyles}>{asset.size || "Unknown"}</p>
                  </div>
                </div>

                <div style={detailItemStyles}>
                  <div style={detailIconStyles}>
                    <Calendar size={20} />
                  </div>
                  <div style={detailTextStyles}>
                    <p style={detailLabelStyles}>Date</p>
                    <p style={detailValueStyles}>{asset.date || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={actionsStyles}>
                <button
                  style={primaryButtonStyles}
                  onClick={() => onDownload(asset)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b82f6";
                  }}
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssetModal;
