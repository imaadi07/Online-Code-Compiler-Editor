import { useState, useMemo } from "react";
import {
  FilePlus,
  FolderPlus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  PanelLeftClose,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
} from "lucide-react";
import { getFileIcon } from "../constants/templates";

// Helper to filter nodes recursively if searchFilter is present
const filterNodes = (nodes, query) => {
  if (!query) return nodes;
  const lower = query.toLowerCase();

  return nodes.reduce((acc, node) => {
    if (node.type === "file") {
      if (node.name.toLowerCase().includes(lower)) {
        acc.push(node);
      }
    } else if (node.type === "folder") {
      const matchingChildren = filterNodes(node.children || [], query);
      if (node.name.toLowerCase().includes(lower) || matchingChildren.length > 0) {
        acc.push({
          ...node,
          children: matchingChildren.length > 0 ? matchingChildren : node.children,
          isOpen: true,
        });
      }
    }
    return acc;
  }, []);
};

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
  const [searchFilter, setSearchFilter] = useState("");

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
    e?.preventDefault();
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

  const visibleTree = useMemo(() => {
    return filterNodes(fileTree || [], searchFilter);
  }, [fileTree, searchFilter]);

  // Recursive tree renderer
  const renderNodes = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.type === "folder";
      const isFolderOpen = Boolean(expandedFolders[node.id] ?? node.isOpen ?? true);
      const isActive = !isFolder && node.id === activeFileId;

      return (
        <div key={node.id} className="tree-item-group">
          <div
            className={`tree-row ${isActive ? "is-active" : ""} ${isFolder ? "is-folder" : "is-file"}`}
            style={{ paddingLeft: `${depth * 14 + 12}px` }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.id);
              } else {
                onSelectFile(node.id);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (isFolder) toggleFolder(node.id);
                else onSelectFile(node.id);
              }
            }}
            role="treeitem"
            aria-selected={isActive}
            aria-expanded={isFolder ? isFolderOpen : undefined}
            tabIndex={0}
            title={node.path || node.name}
          >
            {isFolder ? (
              <span className="folder-chevron" aria-hidden="true">
                {isFolderOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted" />
                )}
              </span>
            ) : null}

            <span className="file-glyph" aria-hidden="true">
              {isFolder ? (
                isFolderOpen ? (
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Folder className="w-4 h-4 text-cyan-500" />
                )
              ) : (
                <span className="lang-emoji-icon">{getFileIcon(node.name)}</span>
              )}
            </span>

            <span className="node-name">{node.name}</span>

            {node.isEntry && <span className="entry-tag">ENTRY</span>}

            {/* Quick Actions (only visible on focus/hover) */}
            <div className="node-actions" onClick={(e) => e.stopPropagation()}>
              {isFolder && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStartCreate("file", node.id)}
                    className="node-action-btn"
                    title={`Add file to ${node.name}`}
                    aria-label={`Add file to ${node.name}`}
                  >
                    <FilePlus className="w-3.5 h-3.5 text-muted hover:text-cyan-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartCreate("folder", node.id)}
                    className="node-action-btn"
                    title={`Add subfolder to ${node.name}`}
                    aria-label={`Add subfolder to ${node.name}`}
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-muted hover:text-cyan-400" />
                  </button>
                </>
              )}

              {!node.isEntry && (
                <button
                  type="button"
                  onClick={() => onDeleteNode(node.id)}
                  className="node-action-btn delete-btn"
                  title={`Delete ${node.name}`}
                  aria-label={`Delete ${node.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Render children if folder is open */}
          {isFolder && isFolderOpen && (
            <div className="folder-children" role="group">
              {/* Inline create input inside folder */}
              {creatingType && targetFolderId === node.id && (
                <form
                  onSubmit={handleCommitCreate}
                  className="inline-create-row"
                  style={{ paddingLeft: `${(depth + 1) * 14 + 12}px` }}
                >
                  <span className="inline-icon" aria-hidden="true">
                    {creatingType === "file" ? (
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-cyan-400" />
                    )}
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
                    aria-label={`New ${creatingType} name`}
                  >
                  </input>
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
    <aside
      className={`file-explorer-sidebar ${isOpen ? "is-open" : "is-collapsed"}`}
      aria-label="Project Files Explorer"
    >
      {/* Explorer Header */}
      <div className="explorer-header">
        <div className="explorer-header-left">
          <span className="explorer-title">Project Files</span>
        </div>

        <div className="explorer-tools">
          <button
            type="button"
            onClick={() => handleStartCreate("file", null)}
            className="tool-btn"
            title="Create New File in Root"
            aria-label="New File"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleStartCreate("folder", null)}
            className="tool-btn"
            title="Create New Folder in Root"
            aria-label="New Folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleOpen}
            className="tool-btn collapse-toggle-btn"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Search Filter Input */}
      <div className="explorer-search-cage">
        <Search className="search-filter-icon" aria-hidden="true" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter workspace files..."
          className="search-filter-input"
          aria-label="Filter workspace files"
        />
        {searchFilter && (
          <button
            type="button"
            onClick={() => setSearchFilter("")}
            className="search-clear-btn"
            title="Clear filter"
          >
            ×
          </button>
        )}
      </div>

      {/* Explorer Tree Body */}
      <div className="explorer-body" role="tree" aria-label="Project Structure">
        {/* Inline input at root */}
        {creatingType && targetFolderId === null && (
          <form
            onSubmit={handleCommitCreate}
            className="inline-create-row"
            style={{ paddingLeft: "12px" }}
          >
            <span className="inline-icon" aria-hidden="true">
              {creatingType === "file" ? (
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
              )}
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
              aria-label={`New ${creatingType} name`}
            />
          </form>
        )}

        {visibleTree.length === 0 && searchFilter ? (
          <div className="explorer-empty-search">
            <FileText className="w-6 h-6 text-muted mb-2" />
            <p>No files match &ldquo;{searchFilter}&rdquo;</p>
          </div>
        ) : (
          renderNodes(visibleTree)
        )}
      </div>
    </aside>
  );
}
