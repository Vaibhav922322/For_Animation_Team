import { useState, useMemo, useEffect, type CSSProperties } from "react";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { SearchBar } from "./components/SearchBar";
import AssetGrid from "./components/AssetGrid";
import AssetModal from "./components/AssetModal";
import FilterBar, { type FilterType, type SortType } from "./components/FilterBar";
import type { Asset } from "./components/AssetCard";
import SplitText from "./components/SplitText";
import ShinyText from "./components/ShinyText";
import Antigravity from "./components/Antigravity";
import DownloadOverlay from "./components/DownloadOverlay";
import RefreshOverlay from "./components/RefreshOverlay";
import { findFiles, refreshFiles, downloadFile, type FileMetadata } from "./services/api";

// Helper to map API metadata to Asset interface
const mapMetadataToAsset = (file: FileMetadata): Asset => {
  const extension = file.file_name.split('.').pop()?.toLowerCase() || '';
  let type: 'model' | 'texture' | 'animation' | 'other' = 'other';
  
  if (['fbx', 'obj', 'blend', 'gltf', 'glb'].includes(extension)) type = 'model';
  else if (['png', 'jpg', 'jpeg', 'tga', 'tif', 'tiff'].includes(extension)) type = 'texture';
  else if (['mp4', 'mov', 'avi'].includes(extension)) type = 'animation'; 

  // Format size
  const sizeMB = (file.file_size / (1024 * 1024)).toFixed(1);
  
  return {
    id: file.full_unc_path, 
    name: file.file_name,
    type,
    size: `${sizeMB} MB`,
    date: "Unknown", 
    // Store original metadata for download
    // Robust Fallback: If host_ip is missing, default to 127.0.0.1 to pass backend validation
    host_ip: file.host_ip || "127.0.0.1",
    host_name: file.host_name || file.host_ip || "Localhost",
    shared_folder_name: file.shared_folder_name,
    file_path: file.file_path,
    is_file: file.is_file,
  };
};

// ... inside App component ...


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
  const [currentPath, setCurrentPath] = useState("/"); // Default to root
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeSort, setActiveSort] = useState<SortType>("name-asc");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(-1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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

  // Fetch logic
  const fetchAssets = async (query: string, path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // If query exists, global search (path ignored/undefined). Else browse path.
      const files = await findFiles(query || undefined, query ? undefined : path);
      const mappedAssets = files.map(mapMetadataToAsset);
      setAssets(mappedAssets);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError("Failed to load assets. Check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load & Search/Path change
  useEffect(() => {
    fetchAssets(searchQuery, currentPath);
  }, [searchQuery, currentPath]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If searching, we effectively leave current path context (Global Search)
    // Or we could search within path? Let's stick to Global Search logic for now as per plan
    if (query) {
      // Logic handled in useEffect
    } else {
      // If cleared, go back to currentPath viewing
    }
  };

  const handleNavigate = (path: string) => {
    setSearchQuery(""); // Clear search when browsing
    setCurrentPath(path);
  };

  const handleAssetClick = (asset: Asset) => {
    if (asset.is_file) {
      setSelectedAsset(asset);
      setIsModalOpen(true);
    } else {
      // It's a folder -> Navigate
      // asset.file_path should be the absolute path of the folder (relative to share?)
      // backend returns full path relative to share.
      if (asset.file_path) {
        handleNavigate(asset.file_path);
      }
    }
  };

  const handleAssetDownload = async (asset: Asset) => {
    const { host_ip, shared_folder_name, file_path } = asset as any;
    
    if (host_ip && shared_folder_name && file_path) {
      try {
        setDownloadProgress(-1);
        await downloadFile(
          host_ip,
          shared_folder_name,
          file_path,
          () => setIsDownloading(true),
          () => { setIsDownloading(false); setDownloadProgress(-1); },
          (percent) => setDownloadProgress(percent)
        );
      } catch (err) {
        console.error(err);
        setIsDownloading(false);
        setDownloadProgress(-1);
        setError("Download failed: " + (err as Error).message);
      }
    } else {
      setError("Missing file metadata for download");
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFiles();
      // Re-search if query exists, or re-fetch current path
      if (searchQuery) handleSearch(searchQuery);
      else fetchAssets("", currentPath);
    } catch (err) {
      console.error(err);
      setError("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  const handleBack = () => {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.length === 0 ? "/" : "/" + parts.join("/");
    handleNavigate(newPath);
  };

  const showResults = assets.length > 0 || isLoading || currentPath !== '/';

  return (
    <>
      {/* ... overlays ... */}
      <DownloadOverlay isVisible={isDownloading} progress={downloadProgress} />
      <RefreshOverlay isVisible={isRefreshing} />
      
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
          {/* ... top section (search/header) ... */}
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

          {/* Breadcrumbs - Moved OUTSIDE showResults to be always visible */}
          {!searchQuery && (
            <div style={{ width: "100%", maxWidth: "1200px", display: "flex", alignItems: "center", gap: "8px", padding: "0 0 24px 0", color: "#4b5563", fontSize: "0.9rem" }}>
              {/* Back Button */}
              <button
                 onClick={handleBack}
                 disabled={currentPath === "/"}
                 style={{
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   padding: "8px",
                   marginRight: "8px",
                   borderRadius: "8px",
                   border: "1px solid #e5e7eb",
                   backgroundColor: currentPath === "/" ? "#f3f4f6" : "#ffffff",
                   color: currentPath === "/" ? "#9ca3af" : "#4b5563",
                   cursor: currentPath === "/" ? "default" : "pointer",
                   transition: "all 0.2s"
                 }}
                 title="Go Back"
              >
                <ArrowLeft size={16} />
              </button>
  
              <div 
                style={{ display: "flex", alignItems: "center", cursor: "pointer", color: currentPath === "/" ? "#1e293b" : "#6b7280" }}
                onClick={() => handleNavigate("/")}
              >
                <Home size={16} />
              </div>
              {currentPath !== "/" && currentPath.split("/").filter(Boolean).map((segment, index, array) => {
                const path = "/" + array.slice(0, index + 1).join("/");
                const isLast = index === array.length - 1;
                return (
                  <div key={path} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ChevronRight size={14} color="#9ca3af" />
                    <span 
                      style={{ 
                        cursor: isLast ? "default" : "pointer", 
                        fontWeight: isLast ? 600 : 400,
                        color: isLast ? "#1e293b" : "#6b7280"
                      }}
                      onClick={() => !isLast && handleNavigate(path)}
                    >
                      {segment}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {showResults ? (
            <>
              <h2 style={resultsTitleStyles}>
                {searchQuery ? "Results for \"" + searchQuery + "\"" : "Browse Assets"}
              </h2>
              
              {/* Breadcrumbs Removed from here */}


        {/* Filters */}
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
