import { type CSSProperties } from "react";
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
      <div style={gridStyles}>
        {assets.map((asset, index) => (
          <div key={`${asset.id}-${index}`}>
            <AssetCard
              asset={asset}
              onClick={() => onAssetClick(asset)}
              onDownload={() => onAssetDownload(asset)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetGrid;
