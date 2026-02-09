import { useState, useMemo, type CSSProperties } from "react";
import { SearchBar } from "./components/SearchBar";
import AssetGrid from "./components/AssetGrid";
import AssetModal from "./components/AssetModal";
import FilterBar, { type FilterType, type SortType } from "./components/FilterBar";
import type { Asset } from "./components/AssetCard";
import SplitText from "./components/SplitText";
import ShinyText from "./components/ShinyText";
import Antigravity from "./components/Antigravity";
import { findFiles, refreshFiles, downloadFile, type FileMetadata } from "./services/api";

// Helper to map API metadata to Asset interface
const mapMetadataToAsset = (file: FileMetadata): Asset => {
  const extension = file.file_name.split('.').pop()?.toLowerCase() || '';
  let type: 'model' | 'texture' | 'animation' | 'other' = 'other';
  
  if (['fbx', 'obj', 'blend', 'gltf', 'glb'].includes(extension)) type = 'model';
  else if (['png', 'jpg', 'jpeg', 'tga', 'tif', 'tiff'].includes(extension)) type = 'texture';
  else if (['mp4', 'mov', 'avi'].includes(extension)) type = 'animation'; // Note: API might not return video files as animations, but 3D animations are usually FBX too.

  // Format size
  const sizeMB = (file.file_size / (1024 * 1024)).toFixed(1);
  
  return {
    id: file.file_path, // Use path as unique ID
    name: file.file_name,
    type,
    size: `${sizeMB} MB`,
    date: "Unknown", // API doesn't provide date
    // Store original metadata for download
    host_ip: file.host_ip,
    shared_folder_name: file.shared_folder_name,
    file_path: file.file_path,
  };
};


const backgroundStyles: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: 0,
  pointerEvents: "auto",
};

const pageContainerStyles: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: 0,
  fontFamily: "system-ui, -apple-system, sans-serif",
  position: "relative",
  zIndex: 1,
};

const topSectionStyles: CSSProperties = {
  height: "45vh",
  minHeight: "350px",
  backgroundImage: "url('/Gemini_Generated_Image_6acyq46acyq46acy.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  borderRadius: "0 0 40px 40px",
  overflow: "hidden",
};

const overlayStyles: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
};

const contentStyles: CSSProperties = {
  position: "relative",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0 24px",
  width: "100%",
};

const headingStyles: CSSProperties = {
  fontSize: "3rem",
  fontWeight: 700,
  color: "#ffffff",
  marginBottom: "12px",
  letterSpacing: "-0.025em",
  textAlign: "center",
  textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
};

const subtitleStyles: CSSProperties = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "1.125rem",
  marginBottom: "32px",
  textAlign: "center",
};

const searchContainerStyles: CSSProperties = {
  width: "100%",
  maxWidth: "672px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "12px",
};

const refreshButtonStyles: CSSProperties = {
  padding: "12px 24px",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  height: "48px",
};

const errorStyles: CSSProperties = {
  color: "#ef4444",
  backgroundColor: "#fee2e2",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "16px",
  textAlign: "center",
  maxWidth: "600px",
  width: "100%",
};

const bottomSectionStyles: CSSProperties = {
  flex: 1,
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: "48px",
  paddingBottom: "48px",
  paddingLeft: "24px",
  paddingRight: "24px",
};

const resultsTitleStyles: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "#1e293b",
  marginBottom: "24px",
  textAlign: "center",
};

const placeholderTextStyles: CSSProperties = {
  color: "#9ca3af",
  fontSize: "1rem",
  textAlign: "center",
};

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeSort, setActiveSort] = useState<SortType>("name-asc");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    let results = [...assets];
    // Filter by type
    if (activeFilter !== "all") {
      results = results.filter((asset) => asset.type === activeFilter);
    }
    // Sort
    results.sort((a, b) => {
      switch (activeSort) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "type": return a.type.localeCompare(b.type);
        default: return 0;
      }
    });
    return results;
  }, [assets, activeFilter, activeSort]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setAssets([]); // Clear results if query is empty
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const metadata = await findFiles(query);
      const mappedAssets = metadata.map(mapMetadataToAsset);
      setAssets(mappedAssets);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch assets. Please make sure the backend is running.");
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleAssetDownload = async (asset: Asset) => {
    // We need host_ip and shared_folder_name which we stored in the asset object (requires type extension)
    // Coerce type or update interface. For now, asserting as any to access hidden props.
    const { host_ip, shared_folder_name, file_path } = asset as any;
    
    if (host_ip && shared_folder_name && file_path) {
      try {
        await downloadFile(host_ip, shared_folder_name, file_path);
      } catch (err) {
        console.error(err);
        alert("Download failed: " + (err as Error).message);
      }
    } else {
      alert("Missing file metadata for download");
    }
  };
  
  const handleRefresh = async () => {
    try {
      await refreshFiles();
      alert("Refresh completed successfully");
      // Optionally re-search if query exists
      if (searchQuery) handleSearch(searchQuery);
    } catch (err) {
      console.error(err);
      alert("Refresh failed");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  const showResults = assets.length > 0 || isLoading;

  return (
    <>
      {/* Antigravity Background */}
      <div style={backgroundStyles}>
        <Antigravity
          count={300}
          magnetRadius={6}
          ringRadius={7}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.5}
          lerpSpeed={0.05}
          color="#00008C"
          autoAnimate
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={1}
          pulseSpeed={3}
          particleShape="capsule"
          fieldStrength={10}
        />
      </div>

      {/* Main Content */}
      <div style={pageContainerStyles}>
        <div style={topSectionStyles}>
          <div style={overlayStyles} />
          <div style={contentStyles}>
            <SplitText
              text="MODEL SHARING APP"
              style={headingStyles}
              delay={50}
              duration={0.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="center"
            />
            <p style={subtitleStyles}>
              <ShinyText
                text="Search and discover 3D models, textures, and assets"
                speed={3}
                delay={0.5}
                color="rgba(255, 255, 255, 0.7)"
                shineColor="#ffffff"
                spread={120}
                direction="left"
              />
            </p>
            <div style={searchContainerStyles}>
              <SearchBar.Root onSearch={handleSearch}>
                <SearchBar.Icon />
                <SearchBar.Input placeholder="Search for models, textures..." />
                <SearchBar.Clear />
                <SearchBar.Button>Go</SearchBar.Button>
              </SearchBar.Root>
              <button 
                style={refreshButtonStyles} 
                onClick={handleRefresh}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
              >
                Refresh
              </button>
            </div>

          </div>
        </div>
        <div style={bottomSectionStyles}>
          {error && <div style={errorStyles}>{error}</div>}
          {showResults ? (
            <>
              <h2 style={resultsTitleStyles}>
                {searchQuery ? "Results for \"" + searchQuery + "\"" : "Browse Assets"}
              </h2>
              <FilterBar
                activeFilter={activeFilter}
                activeSort={activeSort}
                onFilterChange={setActiveFilter}
                onSortChange={setActiveSort}
                resultCount={filteredAssets.length}
              />
              <AssetGrid
                assets={filteredAssets}
                onAssetClick={handleAssetClick}
                onAssetDownload={handleAssetDownload}
              />
            </>
          ) : (
            <p style={placeholderTextStyles}>
              Search for assets or use the filters to browse
            </p>
          )}
        </div>
        <AssetModal
          asset={selectedAsset}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDownload={handleAssetDownload}
        />
      </div>
    </>
  );
}

export default App;
