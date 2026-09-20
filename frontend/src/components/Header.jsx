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
}) {
  return (
    <header className="instrument-header" id="ide-main-header">
      <div className="header-zone-left">
        {/* Brand Identity */}
        <div
          className="brand-plate clickable-brand"
          onClick={() => onViewChange("dashboard")}
          title="Return to Dashboard"
          role="button"
          tabIndex={0}
          id="brand-home-link"
          onKeyDown={(e) => e.key === "Enter" && onViewChange("dashboard")}
        >
          <div className="brand-glyph" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">CODECRAFT</span>
            <span className="brand-edition">v1.2 // RUNTIME</span>
          </div>
        </div>

        <div className="instrument-divider" />

        {/* View Switcher: Dashboard vs Compiler */}
        <nav className="view-switcher" aria-label="Main Navigation" id="main-navigation">
          <button
            type="button"
            id="nav-btn-dashboard"
            onClick={() => onViewChange("dashboard")}
            className={`nav-pill ${currentView === "dashboard" ? "active" : ""}`}
            title="Overview & Runtime Selection"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            id="nav-btn-compiler"
            onClick={() => onViewChange("compiler")}
            className={`nav-pill ${currentView === "compiler" ? "active" : ""}`}
            title="Active Code Workspace"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Compiler</span>
          </button>
        </nav>

        {/* In Compiler view: show language and font size controls */}
        {currentView === "compiler" && (
          <>
            <div className="instrument-divider" />
            <div className="deck-control-group">
              <div className="selector-cage">
                <label htmlFor="language-select" className="sr-only">
                  Target Language
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="milled-select"
                  disabled={isLoading}
                  title="Target language runtime"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.icon} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="selector-cage font-cage">
                <label htmlFor="font-size-select" className="sr-only">
                  Type Scale
                </label>
                <select
                  id="font-size-select"
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(Number(e.target.value))}
                  className="milled-select compact-select"
                  title="Editor font scale"
                >
                  {FONT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="header-zone-right">
        {currentView === "dashboard" ? (
          <button
            type="button"
            id="btn-launch-compiler-header"
            onClick={() => onViewChange("compiler")}
            className="plate-btn plate-btn-cobalt"
            title="Open the active code workspace"
          >
            <span>Launch Compiler</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : (
          <>
            <button
              type="button"
              id="btn-reset-boilerplate"
              onClick={onResetCode}
              className="plate-btn plate-btn-ghost"
              title="Reset active buffer to starter boilerplate"
              disabled={isLoading}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset Boilerplate</span>
            </button>

            <button
              type="button"
              id="btn-flush-logs"
              onClick={onClearConsole}
              className="plate-btn plate-btn-ghost"
              title="Flush output and error logs"
              disabled={isLoading}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Flush Logs</span>
            </button>

            <div className="instrument-divider" />

            <button
              type="button"
              id="btn-execute-run"
              onClick={onRun}
              disabled={isLoading}
              className={`plate-btn plate-btn-cobalt ${isLoading ? "is-executing" : ""}`}
              title="Compile and Execute Program (Ctrl+Enter)"
            >
              {isLoading ? (
                <>
                  <span className="ignition-spinner" aria-hidden="true" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>EXECUTE</span>
                  <kbd className="key-tag">Ctrl+↵</kbd>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
