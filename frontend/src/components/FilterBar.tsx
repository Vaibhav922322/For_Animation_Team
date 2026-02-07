import { useState, type CSSProperties } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

type FilterType = "all" | "model" | "texture" | "animation";
type SortType = "name-asc" | "name-desc" | "type";

interface FilterBarProps {
  activeFilter: FilterType;
  activeSort: SortType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sort: SortType) => void;
  resultCount: number;
}

// =============================================================================
// Styles
// =============================================================================
const containerStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  width: "100%",
  maxWidth: "1200px",
  marginBottom: "24px",
};

const leftSectionStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const rightSectionStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const filterChipStyles = (isActive: boolean): CSSProperties => ({
  padding: "8px 16px",
  borderRadius: "20px",
  fontSize: "0.85rem",
  fontWeight: 500,
  backgroundColor: isActive ? "#3b82f6" : "#f1f5f9",
  color: isActive ? "#ffffff" : "#64748b",
  borderWidth: 0,
  borderStyle: "none",
  cursor: "pointer",
  transition: "all 0.15s ease",
});

const sortContainerStyles: CSSProperties = {
  position: "relative",
};

const sortButtonStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 16px",
  borderRadius: "10px",
  fontSize: "0.85rem",
  fontWeight: 500,
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  borderWidth: 0,
  borderStyle: "none",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const dropdownStyles = (isOpen: boolean): CSSProperties => ({
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#e5e7eb",
  overflow: "hidden",
  opacity: isOpen ? 1 : 0,
  visibility: isOpen ? "visible" : "hidden",
  transform: isOpen ? "translateY(0)" : "translateY(-8px)",
  transition: "all 0.2s ease",
  zIndex: 100,
  minWidth: "150px",
});

const dropdownItemStyles = (isActive: boolean): CSSProperties => ({
  display: "block",
  width: "100%",
  padding: "12px 16px",
  fontSize: "0.85rem",
  fontWeight: isActive ? 600 : 400,
  backgroundColor: isActive ? "#eff6ff" : "transparent",
  color: isActive ? "#3b82f6" : "#1e293b",
  borderWidth: 0,
  borderStyle: "none",
  cursor: "pointer",
  textAlign: "left",
  transition: "background-color 0.15s ease",
});

const resultCountStyles: CSSProperties = {
  fontSize: "0.85rem",
  color: "#9ca3af",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

// =============================================================================
// Component
// =============================================================================
const FilterBar = ({
  activeFilter,
  activeSort,
  onFilterChange,
  onSortChange,
  resultCount,
}: FilterBarProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "model", label: "Models" },
    { key: "texture", label: "Textures" },
    { key: "animation", label: "Animations" },
  ];

  const sortOptions: { key: SortType; label: string }[] = [
    { key: "name-asc", label: "Name A-Z" },
    { key: "name-desc", label: "Name Z-A" },
    { key: "type", label: "By Type" },
  ];

  const currentSortLabel = sortOptions.find((s) => s.key === activeSort)?.label || "Sort";

  return (
    <div style={containerStyles}>
      {/* Filter Chips */}
      <div style={leftSectionStyles}>
        {filters.map((filter) => (
          <button
            key={filter.key}
            style={filterChipStyles(activeFilter === filter.key)}
            onClick={() => onFilterChange(filter.key)}
            onMouseEnter={(e) => {
              if (activeFilter !== filter.key) {
                e.currentTarget.style.backgroundColor = "#e2e8f0";
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== filter.key) {
                e.currentTarget.style.backgroundColor = "#f1f5f9";
              }
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Right Section: Count & Sort */}
      <div style={rightSectionStyles}>
        <span style={resultCountStyles}>
          <SlidersHorizontal size={14} />
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </span>

        {/* Sort Dropdown */}
        <div style={sortContainerStyles}>
          <button
            style={sortButtonStyles}
            onClick={() => setIsSortOpen(!isSortOpen)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
            }}
          >
            {currentSortLabel}
            <ChevronDown
              size={16}
              style={{
                transform: isSortOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          <div style={dropdownStyles(isSortOpen)}>
            {sortOptions.map((option) => (
              <button
                key={option.key}
                style={dropdownItemStyles(activeSort === option.key)}
                onClick={() => {
                  onSortChange(option.key);
                  setIsSortOpen(false);
                }}
                onMouseEnter={(e) => {
                  if (activeSort !== option.key) {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSort !== option.key) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
export type { FilterType, SortType };
