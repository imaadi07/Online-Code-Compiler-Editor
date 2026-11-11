import { motion } from "motion/react";
import { PanelLeft, X } from "lucide-react";
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
    <div className="editor-tab-bar" role="tablist" aria-label="Open Files">
      {/* Explorer Toggle Button on Left of tabs */}
      <button
        type="button"
        onClick={onToggleExplorer}
        className={`tab-bar-explorer-btn ${isExplorerOpen ? "active" : ""}`}
        title={isExplorerOpen ? "Hide File Explorer (Ctrl+B)" : "Show File Explorer (Ctrl+B)"}
        aria-label={isExplorerOpen ? "Hide File Explorer" : "Show File Explorer"}
      >
        <PanelLeft className="w-4 h-4" />
      </button>

      {/* Tabs list */}
      <div className="tab-scroll-container">
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;

          return (
            <div
              key={file.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              className={`file-tab-item ${isActive ? "active-tab" : ""}`}
              onClick={() => onSelectTab(file.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectTab(file.id);
                }
              }}
              title={file.path || file.name}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-top-border"
                  className="active-tab-indicator"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}

              <span className="tab-file-icon" aria-hidden="true">
                {getFileIcon(file.name)}
              </span>
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
                  aria-label={`Close ${file.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
