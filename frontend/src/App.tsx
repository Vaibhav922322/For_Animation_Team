import { useState, useMemo, type CSSProperties } from "react";
import { SearchBar } from "./components/SearchBar";
import AssetGrid from "./components/AssetGrid";
import AssetModal from "./components/AssetModal";
import FilterBar, { type FilterType, type SortType } from "./components/FilterBar";
import type { Asset } from "./components/AssetCard";
import SplitText from "./components/SplitText";
import ShinyText from "./components/ShinyText";

const mockAssets: Asset[] = [
  { id: "1", name: "Character_Warrior_3D.fbx", type: "model", size: "24.5 MB", date: "Feb 5, 2026" },
  { id: "2", name: "Environment_Forest.blend", type: "model", size: "156 MB", date: "Feb 4, 2026" },
  { id: "3", name: "Texture_Wood_4K.png", type: "texture", size: "12.8 MB", date: "Feb 3, 2026" },
  { id: "4", name: "Animation_Walk_Cycle.fbx", type: "animation", size: "8.2 MB", date: "Feb 2, 2026" },
  { id: "5", name: "Character_Wizard_Rigged.fbx", type: "model", size: "32.1 MB", date: "Feb 1, 2026" },
  { id: "6", name: "Prop_Sword_Detailed.obj", type: "model", size: "5.4 MB", date: "Jan 31, 2026" },
  { id: "7", name: "Environment_Castle.blend", type: "model", size: "245 MB", date: "Jan 30, 2026" },
  { id: "8", name: "Texture_Stone_PBR.png", type: "texture", size: "18.6 MB", date: "Jan 29, 2026" },
  { id: "9", name: "Animation_Run_Cycle.fbx", type: "animation", size: "6.8 MB", date: "Jan 28, 2026" },
  { id: "10", name: "Character_Dragon.fbx", type: "model", size: "89.3 MB", date: "Jan 27, 2026" },
  { id: "11", name: "Texture_Metal_Rust.png", type: "texture", size: "15.2 MB", date: "Jan 26, 2026" },
  { id: "12", name: "Animation_Idle.fbx", type: "animation", size: "3.1 MB", date: "Jan 25, 2026" },
];

const pageContainerStyles: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: 0,
  fontFamily: "system-ui, -apple-system, sans-serif",
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
};

const bottomSectionStyles: CSSProperties = {
  flex: 1,
  backgroundColor: "#ffffff",
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

  const filteredAssets = useMemo(() => {
    let results = [...mockAssets];
    if (searchQuery.trim()) {
      results = results.filter((asset) =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeFilter !== "all") {
      results = results.filter((asset) => asset.type === activeFilter);
    }
    results.sort((a, b) => {
      switch (activeSort) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "type": return a.type.localeCompare(b.type);
        default: return 0;
      }
    });
    return results;
  }, [searchQuery, activeFilter, activeSort]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleAssetDownload = (asset: Asset) => {
    alert("Downloading: " + asset.name);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  };

  const showResults = searchQuery.trim() || activeFilter !== "all";

  return (
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
          </div>
        </div>
      </div>
      <div style={bottomSectionStyles}>
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
  );
}

export default App;
