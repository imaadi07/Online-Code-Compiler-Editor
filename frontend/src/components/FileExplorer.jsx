import { useState } from "react";
import { getFileIcon } from "../constants/templates";

export default function FileExplorer({
  fileTree,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteNode,
  isOpen,
  onToggleOpen,
}) {
  const [creatingType, setCreatingType] = useState(null); // 'file' | 'folder' | null
  const [targetFolderId, setTargetFolderId] = useState(null); // null means root
  const [newItemName, setNewItemName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleStartCreate = (type, folderId = null) => {
    setCreatingType(type);
    setTargetFolderId(folderId);
    setNewItemName("");
    if (folderId) {
      setExpandedFolders((prev) => ({ ...prev, [folderId]: true }));
    }
  };

  const handleCommitCreate = (e) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) {
      setCreatingType(null);
      return;
    }

    if (creatingType === "file") {
      onCreateFile(trimmed, targetFolderId);
    } else if (creatingType === "folder") {
      onCreateFolder(trimmed, targetFolderId);
    }

    setCreatingType(null);
    setNewItemName("");
  };

  const handleCancelCreate = () => {
    setCreatingType(null);
    setNewItemName("");
  };

  // Recursive tree node renderer
  const renderNodes = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.type === "folder";
      const isFolderOpen = expandedFolders[node.id] ?? node.isOpen ?? true;
      const isActive = !isFolder && node.id === activeFileId;

      return (
        <div key={node.id} className="tree-item-group">
          <div
            className={`tree-row ${isActive ? "is-active" : ""} ${isFolder ? "is-folder" : "is-file"}`}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.id);
              } else {
                onSelectFile(node.id);
              }
            }}
            title={node.path || node.name}
          >
            {isFolder ? (
              <span className="folder-chevron">
                {isFolderOpen ? "▾" : "▸"}
              </span>
            ) : (
              <span className="file-glyph">{getFileIcon(node.name)}</span>
            )}

            <span className="node-name">{node.name}</span>

            {node.isEntry && <span className="entry-tag">MAIN</span>}

            {/* Hover Actions */}
            <div className="node-actions" onClick={(e) => e.stopPropagation()}>
              {isFolder && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartCreate("file", node.id)}
                    className="node-action-btn"
                    title={`Add file to ${node.name}`}
                  >
                    +📄
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartCreate("folder", node.id)}
                    className="node-action-btn"
                    title={`Add subfolder to ${node.name}`}
                  >
                    +📁
                  </button>
                </>
              )}

              {!node.isEntry && (
                <button
                  type="button"
                  onClick={() => onDeleteNode(node.id)}
                  className="node-action-btn delete-btn"
                  title={`Delete ${node.name}`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Render children if expanded */}
          {isFolder && isFolderOpen && (
            <div className="folder-children">
              {/* Inline input inside this folder */}
              {creatingType && targetFolderId === node.id && (
                <form
                  onSubmit={handleCommitCreate}
                  className="inline-create-row"
                  style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
                >
                  <span className="inline-icon">
                    {creatingType === "file" ? "📄" : "📁"}
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && handleCancelCreate()}
                    onBlur={handleCommitCreate}
                    placeholder={creatingType === "file" ? "filename.py" : "folder_name"}
                    className="inline-input"
                  />
                </form>
              )}
              {node.children && renderNodes(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <aside className={`file-explorer-sidebar ${isOpen ? "is-open" : "is-collapsed"}`}>
      {/* Explorer Header */}
      <div className="explorer-header">
        <span className="explorer-title">FILES</span>

        <div className="explorer-tools">
          <button
            type="button"
            onClick={() => handleStartCreate("file", null)}
            className="tool-btn"
            title="Create New Root File"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleStartCreate("folder", null)}
            className="tool-btn"
            title="Create New Root Folder"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onToggleOpen}
            className="tool-btn toggle-btn"
            title={isOpen ? "Collapse Explorer" : "Expand Explorer"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isOpen ? (
                <polyline points="15 18 9 12 15 6" />
              ) : (
                <polyline points="9 18 15 12 9 6" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Explorer Tree Body */}
      <div className="explorer-body">
        {/* Inline input at root */}
        {creatingType && targetFolderId === null && (
          <form
            onSubmit={handleCommitCreate}
            className="inline-create-row"
            style={{ paddingLeft: "10px" }}
          >
            <span className="inline-icon">
              {creatingType === "file" ? "📄" : "📁"}
            </span>
            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && handleCancelCreate()}
              onBlur={handleCommitCreate}
              placeholder={creatingType === "file" ? "filename.ext" : "folder_name"}
              className="inline-input"
            />
          </form>
        )}

        {fileTree && renderNodes(fileTree)}
      </div>
    </aside>
  );
}
