import { type CSSProperties } from "react";
import { motion } from "motion/react";
import AssetCard, { type Asset } from "./AssetCard";

interface AssetGridProps {
  assets: Asset[];
  onAssetClick: (asset: Asset) => void;
  onAssetDownload: (asset: Asset) => void;
}

// =============================================================================
// Styles
// =============================================================================
const gridContainerStyles: CSSProperties = {
  width: "100%",
  maxWidth: "1200px",
};

const gridStyles: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: "24px",
  padding: "8px",
};

const emptyStateStyles: CSSProperties = {
  textAlign: "center",
  padding: "48px 24px",
  color: "#9ca3af",
};

const emptyIconStyles: CSSProperties = {
  fontSize: "3rem",
  marginBottom: "16px",
};

const emptyTextStyles: CSSProperties = {
  fontSize: "1rem",
  margin: 0,
};

// =============================================================================
// Animation Variants
// =============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    },
  },
};

// =============================================================================
// Component
// =============================================================================
const AssetGrid = ({ assets, onAssetClick, onAssetDownload }: AssetGridProps) => {
  if (assets.length === 0) {
    return (
      <div style={emptyStateStyles}>
        <div style={emptyIconStyles}>📁</div>
        <p style={emptyTextStyles}>No assets found</p>
      </div>
    );
  }

  return (
    <div style={gridContainerStyles}>
      <motion.div
        style={gridStyles}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {assets.map((asset) => (
          <motion.div key={asset.id} variants={itemVariants}>
            <AssetCard
              asset={asset}
              onClick={() => onAssetClick(asset)}
              onDownload={() => onAssetDownload(asset)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default AssetGrid;
