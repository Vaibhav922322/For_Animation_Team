import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Search, X } from "lucide-react";

// =============================================================================
// Context: Shared state between compound components
// =============================================================================
interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;
  handleSearch: () => void;
  clearSearch: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error(
      "SearchBar compound components must be used within <SearchBar.Root>"
    );
  }
  return context;
}

// =============================================================================
// Types
// =============================================================================
interface RootProps {
  children: ReactNode;
  onSearch: (query: string) => void;
  initialQuery?: string;
}

interface InputProps {
  placeholder?: string;
}

interface ButtonProps {
  children?: ReactNode;
}

// =============================================================================
// 1. Root Component - The Container
// =============================================================================
const Root = ({ children, onSearch, initialQuery = "" }: RootProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = useCallback(() => {
    onSearch(query);
  }, [query, onSearch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  const rootStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#ffffff",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: isFocused ? "#2563eb" : "#e5e7eb",
    borderRadius: "9999px",
    paddingTop: "12px",
    paddingBottom: "12px",
    paddingLeft: "20px",
    paddingRight: "20px",
    boxShadow: isFocused
      ? "0 0 0 4px rgba(37, 99, 235, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        isFocused,
        setIsFocused,
        handleSearch,
        clearSearch,
        inputRef,
      }}
    >
      <div style={rootStyles}>{children}</div>
    </SearchContext.Provider>
  );
};

// =============================================================================
// 2. Icon Component
// =============================================================================
const Icon = () => {
  const { isFocused } = useSearchContext();

  const iconStyles: CSSProperties = {
    flexShrink: 0,
    color: isFocused ? "#2563eb" : "#9ca3af",
    transition: "color 0.2s ease",
  };

  return (
    <div style={iconStyles}>
      <Search size={20} strokeWidth={2.5} />
    </div>
  );
};

// =============================================================================
// 3. Input Component
// =============================================================================
const Input = ({ placeholder = "Search..." }: InputProps) => {
  const { query, setQuery, setIsFocused, handleSearch, inputRef } =
    useSearchContext();

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const inputStyles: CSSProperties = {
    flex: 1,
    minWidth: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderStyle: "none",
    outline: "none",
    fontSize: "16px",
    color: "#111827",
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      style={inputStyles}
    />
  );
};

// =============================================================================
// 4. Clear Button
// =============================================================================
const Clear = () => {
  const { query, clearSearch } = useSearchContext();
  const [isHovered, setIsHovered] = useState(false);

  if (!query) return null;

  const clearStyles: CSSProperties = {
    flexShrink: 0,
    padding: "6px",
    borderRadius: "9999px",
    color: isHovered ? "#4b5563" : "#9ca3af",
    backgroundColor: isHovered ? "#f3f4f6" : "transparent",
    borderWidth: 0,
    borderStyle: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  };

  return (
    <button
      type="button"
      onClick={clearSearch}
      aria-label="Clear search"
      style={clearStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <X size={18} strokeWidth={2} />
    </button>
  );
};

// =============================================================================
// 5. Button Component
// =============================================================================
const Button = ({ children }: ButtonProps) => {
  const { handleSearch } = useSearchContext();
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyles: CSSProperties = {
    flexShrink: 0,
    padding: "10px 24px",
    borderRadius: "9999px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: isHovered ? "#1d4ed8" : "#2563eb",
    borderWidth: 0,
    borderStyle: "none",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  };

  return (
    <button
      type="button"
      onClick={handleSearch}
      style={buttonStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children || "Search"}
    </button>
  );
};

// =============================================================================
// Export as Compound Component
// =============================================================================
export const SearchBar = {
  Root,
  Icon,
  Input,
  Clear,
  Button,
};
