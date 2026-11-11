import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  RotateCcw,
  Trash2,
  Sun,
  Moon,
  Command,
  LayoutDashboard,
  Code2,
  ChevronDown,
  Terminal,
  Check,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { SUPPORTED_LANGUAGES, FONT_SIZES } from "../constants/templates";

export default function Header({
  currentView,
  onViewChange,
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  isLoading,
  onRun,
  onResetCode,
  onClearConsole,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
}) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
    };

    if (isLangMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLangMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isLangMenuOpen) {
        setIsLangMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLangMenuOpen]);

  // Font size stepper helpers
  const currentFontIndex = FONT_SIZES.indexOf(fontSize);
  const canDecreaseFont = currentFontIndex > 0;
  const canIncreaseFont = currentFontIndex < FONT_SIZES.length - 1;

  const handleDecreaseFont = () => {
    if (canDecreaseFont) {
      onFontSizeChange(FONT_SIZES[currentFontIndex - 1]);
    }
  };

  const handleIncreaseFont = () => {
    if (canIncreaseFont) {
      onFontSizeChange(FONT_SIZES[currentFontIndex + 1]);
    }
  };

  return (
    <header className="app-header" id="ide-main-header">
      {/* Left Zone: Brand & Primary Navigation */}
      <div className="header-zone-left">
        {/* Brand Identity */}
        <motion.div
          className="brand-plate"
          onClick={() => onViewChange("dashboard")}
          title="Return to Dashboard"
          role="button"
          tabIndex={0}
          id="brand-home-link"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onViewChange("dashboard");
            }
          }}
          aria-label="CodeCraft Dashboard"
        >
          <div className="brand-glyph-glow" aria-hidden="true">
            <div className="brand-glyph">
              <Code2 className="brand-icon" />
            </div>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">CodeCraft</span>
              <span className="brand-tag">v2.5</span>
            </div>
            <span className="brand-edition">Cloud Engineering Studio</span>
          </div>
        </motion.div>

        <div className="instrument-divider" aria-hidden="true" />

        {/* View Switcher Pills */}
        <nav className="view-switcher" aria-label="Main Navigation">
          <button
            type="button"
            id="nav-btn-dashboard"
            onClick={() => onViewChange("dashboard")}
            className={`nav-pill ${currentView === "dashboard" ? "active" : ""}`}
            aria-pressed={currentView === "dashboard"}
            title="Overview & Runtimes"
          >
            <LayoutDashboard className="nav-pill-icon" />
            <span>Dashboard</span>
            {currentView === "dashboard" && (
              <motion.div
                layoutId="nav-pill-active-indicator"
                className="nav-pill-active-bg"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            type="button"
            id="nav-btn-compiler"
            onClick={() => onViewChange("compiler")}
            className={`nav-pill ${currentView === "compiler" ? "active" : ""}`}
            aria-pressed={currentView === "compiler"}
            title="Active Code Workspace"
          >
            <Terminal className="nav-pill-icon" />
            <span>Editor</span>
            {currentView === "compiler" && (
              <motion.div
                layoutId="nav-pill-active-indicator"
                className="nav-pill-active-bg"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </nav>

        {/* In Editor view: Custom Luxury Language Selector Dropdown */}
        {currentView === "compiler" && (
          <>
            <div className="instrument-divider" aria-hidden="true" />

            <div className="custom-lang-dropdown-wrapper" ref={dropdownRef}>
              {/* Accessible hidden select for screen-readers & test automation */}
              <select
                id="language-select"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="sr-only"
                aria-label="Programming Language"
                tabIndex={-1}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>

              {/* Custom Trigger Button */}
              <button
                type="button"
                id="language-dropdown-trigger"
                onClick={() => setIsLangMenuOpen((prev) => !prev)}
                className={`custom-lang-trigger-btn ${isLangMenuOpen ? "is-open" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={isLangMenuOpen}
                disabled={isLoading}
                title="Select language runtime"
              >
                <div className="lang-trigger-icon-box" aria-hidden="true">
                  <span className="lang-trigger-emoji">{currentLangObj.icon}</span>
                </div>
                <span className="lang-trigger-name">{currentLangObj.name}</span>
                <span className="lang-trigger-tag">{currentLangObj.extension}</span>
                <ChevronDown
                  className={`lang-trigger-chevron ${isLangMenuOpen ? "is-rotated" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {/* Animated Floating Popover Menu */}
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    className="custom-lang-popover"
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="listbox"
                    aria-label="Select Runtime"
                  >
                    <div className="lang-popover-header">
                      <span className="lang-popover-title">Execution Runtimes</span>
                      <span className="lang-popover-sub">Sandbox micro-environments</span>
                    </div>

                    <div className="lang-popover-options">
                      {SUPPORTED_LANGUAGES.map((lang) => {
                        const isSelected = lang.id === language;
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`lang-popover-item ${isSelected ? "is-selected" : ""}`}
                            onClick={() => {
                              onLanguageChange(lang.id);
                              setIsLangMenuOpen(false);
                            }}
                          >
                            <div className="lang-item-icon-box" aria-hidden="true">
                              <span className="lang-item-emoji">{lang.icon}</span>
                            </div>

                            <div className="lang-item-content">
                              <div className="lang-item-top">
                                <span className="lang-item-name">{lang.name}</span>
                                <span className="lang-item-badge">{lang.extension}</span>
                              </div>
                              <span className="lang-item-desc">{lang.description}</span>
                            </div>

                            {isSelected && (
                              <div className="lang-item-check" aria-hidden="true">
                                <Check className="w-4 h-4 text-cyan-400" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Center Zone: Quick Command Palette Trigger */}
      <div className="header-zone-center">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="command-trigger-btn"
          title="Open Command Palette (Ctrl+K or ⌘K)"
          aria-label="Open Command Palette"
        >
          <Command className="command-icon" />
          <span className="command-text">Quick actions & files...</span>
          <kbd className="command-kbd">⌘K</kbd>
        </button>
      </div>

      {/* Right Zone: Execution CTA & Utilities */}
      <div className="header-zone-right">
        {/* Editor-only controls */}
        {currentView === "compiler" && (
          <div className="editor-action-cluster">
            {/* Tactile Font Size Stepper */}
            <div className="font-stepper-cluster" title="Editor Font Scale">
              <button
                type="button"
                onClick={handleDecreaseFont}
                disabled={!canDecreaseFont}
                className="font-step-btn"
                title="Decrease font size"
                aria-label="Decrease font size"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="font-step-indicator">{fontSize}px</span>

              <button
                type="button"
                onClick={handleIncreaseFont}
                disabled={!canIncreaseFont}
                className="font-step-btn"
                title="Increase font size"
                aria-label="Increase font size"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Accessible hidden select for tests */}
              <select
                value={fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                className="sr-only"
                aria-label="Change editor font size"
                tabIndex={-1}
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Workspace Button */}
            <button
              type="button"
              onClick={onResetCode}
              disabled={isLoading}
              className="action-icon-btn text-muted"
              title="Reset Project to default files"
              aria-label="Reset Project"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Clear Console Button */}
            <button
              type="button"
              onClick={onClearConsole}
              className="action-icon-btn text-muted"
              title="Clear Console Output"
              aria-label="Clear Console Output"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* High-Velocity Run Button (Primary CTA) */}
        <motion.button
          type="button"
          onClick={onRun}
          disabled={isLoading}
          className={`run-cta-button ${isLoading ? "is-running" : ""}`}
          title="Run Code (Ctrl+Enter or ⌘+Enter)"
          aria-label={isLoading ? "Executing code in isolated container..." : "Run Code"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="run-cta-glow" aria-hidden="true" />
          <div className="run-cta-content">
            {isLoading ? (
              <>
                <span className="run-spinner" aria-hidden="true" />
                <span className="run-label">Executing...</span>
              </>
            ) : (
              <>
                <Play className="run-icon" />
                <span className="run-label">Run Code</span>
                <kbd className="run-shortcut-kbd">⌘↵</kbd>
              </>
            )}
          </div>
        </motion.button>

        <div className="instrument-divider" aria-hidden="true" />

        {/* Theme Toggle Button */}
        <motion.button
          type="button"
          onClick={onToggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label={`Toggle Theme. Current is ${theme}`}
          whileTap={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          {theme === "dark" ? (
            <Sun className="theme-icon sun-icon" />
          ) : (
            <Moon className="theme-icon moon-icon" />
          )}
        </motion.button>
      </div>
    </header>
  );
}
