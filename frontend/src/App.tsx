import { useState, CSSProperties } from "react";
import { SearchBar } from "./components/SearchBar";

// =============================================================================
// Page Styles
// =============================================================================
const pageContainerStyles: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: 0,
  fontFamily: "system-ui, -apple-system, sans-serif",
};

// Top 50% with background image
const topSectionStyles: CSSProperties = {
  height: "50vh",
  backgroundImage: "url('/Gemini_Generated_Image_6acyq46acyq46acy.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

// Overlay for better text readability
const overlayStyles: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
};

// Content on top of overlay
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

// Bottom 50% white section
const bottomSectionStyles: CSSProperties = {
  height: "50vh",
  backgroundColor: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: "48px",
  padding: "48px 24px",
};

const feedbackStyles: CSSProperties = {
  padding: "16px 24px",
  backgroundColor: "#eff6ff",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#bfdbfe",
  borderRadius: "12px",
  color: "#1e40af",
};

const placeholderTextStyles: CSSProperties = {
  color: "#9ca3af",
  fontSize: "1rem",
  textAlign: "center",
};

// =============================================================================
// App Component
// =============================================================================
function App() {
  const [submittedQuery, setSubmittedQuery] = useState("");

  const handleSearch = (query: string) => {
    setSubmittedQuery(query);
    console.log("🔍 Searching for:", query);
  };

  return (
    <div style={pageContainerStyles}>
      {/* Top Section with Background Image */}
      <div style={topSectionStyles}>
        <div style={overlayStyles} />
        <div style={contentStyles}>
          <h1 style={headingStyles}>MODEL SHARING APP</h1>
          <p style={subtitleStyles}>
            Search and discover 3D models, textures, and assets
          </p>

          {/* Search Bar */}
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

      {/* Bottom Section with White Background */}
      <div style={bottomSectionStyles}>
        {submittedQuery ? (
          <div style={feedbackStyles}>
            <p>
              Searching for: <strong>"{submittedQuery}"</strong>
            </p>
          </div>
        ) : (
          <p style={placeholderTextStyles}>Search results will appear here...</p>
        )}
      </div>
    </div>
  );
}

export default App;
