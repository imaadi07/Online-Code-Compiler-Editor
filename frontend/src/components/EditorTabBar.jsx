import { getFileIcon } from "../constants/templates";

export default function EditorTabBar({
  openFiles,
  activeFileId,
  onSelectTab,
  onCloseTab,
  onToggleExplorer,
  isExplorerOpen,
}) {
  return (
    <div className="editor-tab-bar">
      {/* Explorer Toggle Button on Left of tabs */}
      <button
        type="button"
        onClick={onToggleExplorer}
        className={`tab-bar-explorer-btn ${isExplorerOpen ? "active" : ""}`}
        title={isExplorerOpen ? "Hide File Explorer" : "Show File Explorer"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      </button>

      {/* Tabs list */}
      <div className="tab-scroll-container">
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;

          return (
            <div
              key={file.id}
              className={`file-tab-item ${isActive ? "active-tab" : ""}`}
              onClick={() => onSelectTab(file.id)}
              title={file.path || file.name}
            >
              <span className="tab-file-icon">{getFileIcon(file.name)}</span>
              <span className="tab-file-name">{file.name}</span>

              {/* Close Tab Button */}
              {openFiles.length > 1 && (
                <button
                  type="button"
                  className="tab-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  title={`Close ${file.name}`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
