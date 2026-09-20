import { useRef, useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import FileExplorer from "./components/FileExplorer";
import EditorTabBar from "./components/EditorTabBar";
import ConsoleDrawer from "./components/ConsoleDrawer";
import StatusBar from "./components/StatusBar";
import {
  INITIAL_PROJECT_FILES,
  getMonacoLanguage,
} from "./constants/templates";
import "./App.css";

const API_BASE_URL = "http://localhost:3000";

// Helper: Flatten all files in a tree with their full relative paths
const flattenFiles = (nodes, parentPath = "") => {
  let result = [];
  for (const node of nodes) {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.type === "file") {
      result.push({ ...node, path: currentPath });
    } else if (node.type === "folder" && node.children) {
      result = result.concat(flattenFiles(node.children, currentPath));
    }
  }
  return result;
};

// Helper: Find a node by ID in tree
const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === "folder" && node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper: Update file content in tree
const updateNodeContent = (nodes, id, newContent) => {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, content: newContent };
    }
    if (node.type === "folder" && node.children) {
      return {
        ...node,
        children: updateNodeContent(node.children, id, newContent),
      };
    }
    return node;
  });
};

// Helper: Add node to tree
const insertNodeIntoTree = (nodes, targetFolderId, newNode, parentPath = "") => {
  if (targetFolderId === null) {
    const computedPath = newNode.name;
    return [...nodes, { ...newNode, path: computedPath }];
  }

  return nodes.map((node) => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.id === targetFolderId && node.type === "folder") {
      const computedPath = `${currentPath}/${newNode.name}`;
      return {
        ...node,
        isOpen: true,
        children: [...(node.children || []), { ...newNode, path: computedPath }],
      };
    }
    if (node.type === "folder" && node.children) {
      return {
        ...node,
        children: insertNodeIntoTree(node.children, targetFolderId, newNode, currentPath),
      };
    }
    return node;
  });
};

// Helper: Delete node from tree
const deleteNodeFromTree = (nodes, id) => {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.type === "folder" && node.children) {
        return {
          ...node,
          children: deleteNodeFromTree(node.children, id),
        };
      }
      return node;
    });
};

function App() {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // View state: 'dashboard' | 'compiler'
  const [currentView, setCurrentView] = useState("dashboard");

  // Multi-file projects per language
  const [projects, setProjects] = useState(INITIAL_PROJECT_FILES);
  const [language, setLanguage] = useState("python");

  // File Explorer & Editor Tabs state
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const currentTree = projects[language] || [];
  const allCurrentFiles = flattenFiles(currentTree);

  // Active file in editor
  const defaultEntryFile = allCurrentFiles.find((f) => f.isEntry) || allCurrentFiles[0];
  const [activeFileId, setActiveFileId] = useState(defaultEntryFile?.id || "py-main");
  const [openFileIds, setOpenFileIds] = useState([defaultEntryFile?.id || "py-main"]);

  // Console & Execution State
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [activeTab, setActiveTab] = useState("output");
  const [fontSize, setFontSize] = useState(14);
  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });

  // Workspace Split Ratio (Editor % vs Console %)
  const [splitRatio, setSplitRatio] = useState(62);
  const [isDragging, setIsDragging] = useState(false);

  // Retrieve current active file
  const activeFile = allCurrentFiles.find((f) => f.id === activeFileId) || allCurrentFiles[0];
  const activeCode = activeFile ? activeFile.content : "";
  const monacoLanguage = getMonacoLanguage(activeFile?.name || "");

  // Update file content
  const handleCodeChange = (value) => {
    if (!activeFile) return;
    setProjects((prev) => ({
      ...prev,
      [language]: updateNodeContent(prev[language], activeFile.id, value ?? ""),
    }));
  };

  // Switch active language
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newProjectTree = projects[newLang] || INITIAL_PROJECT_FILES[newLang];
    const newFiles = flattenFiles(newProjectTree);
    const newEntry = newFiles.find((f) => f.isEntry) || newFiles[0];
    if (newEntry) {
      setActiveFileId(newEntry.id);
      setOpenFileIds([newEntry.id]);
    }
  };

  const handleLaunchLanguage = (selectedLang) => {
    handleLanguageChange(selectedLang);
    setCurrentView("compiler");
  };

  // File selection from explorer or tab
  const handleSelectFile = (fileId) => {
    setActiveFileId(fileId);
    if (!openFileIds.includes(fileId)) {
      setOpenFileIds((prev) => [...prev, fileId]);
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Close tab
  const handleCloseTab = (fileId) => {
    const nextOpen = openFileIds.filter((id) => id !== fileId);
    setOpenFileIds(nextOpen);
    if (activeFileId === fileId && nextOpen.length > 0) {
      setActiveFileId(nextOpen[nextOpen.length - 1]);
    }
  };

  // Create new file
  const handleCreateFile = (name, targetFolderId) => {
    const newFile = {
      id: `file-${Date.now()}`,
      name,
      type: "file",
      content: `# ${name}\n`,
    };

    setProjects((prev) => {
      const updated = insertNodeIntoTree(prev[language], targetFolderId, newFile);
      return { ...prev, [language]: updated };
    });

    setActiveFileId(newFile.id);
    setOpenFileIds((prev) => [...prev, newFile.id]);
  };

  // Create new folder
  const handleCreateFolder = (name, targetFolderId) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name,
      type: "folder",
      isOpen: true,
      children: [],
    };

    setProjects((prev) => {
      const updated = insertNodeIntoTree(prev[language], targetFolderId, newFolder);
      return { ...prev, [language]: updated };
    });
  };

  // Delete file or folder
  const handleDeleteNode = (id) => {
    const node = findNodeById(currentTree, id);
    const isFolder = node?.type === "folder";
    const confirmMsg = isFolder
      ? `Delete folder '${node.name}' and all its files?`
      : `Delete file '${node?.name}'?`;

    if (!window.confirm(confirmMsg)) return;

    setProjects((prev) => ({
      ...prev,
      [language]: deleteNodeFromTree(prev[language], id),
    }));

    // If deleted node was open in tabs, close it
    setOpenFileIds((prev) => prev.filter((openId) => openId !== id));
    if (activeFileId === id) {
      const remainingFiles = allCurrentFiles.filter((f) => f.id !== id);
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[0].id);
      }
    }
  };

  // Reset current project to boilerplate
  const handleResetProject = () => {
    const confirmation = window.confirm(
      `Revert ${language.toUpperCase()} project back to initial file structure? Unsaved changes will be lost.`
    );
    if (!confirmation) return;

    const initialTree = INITIAL_PROJECT_FILES[language];
    setProjects((prev) => ({
      ...prev,
      [language]: initialTree,
    }));

    const files = flattenFiles(initialTree);
    const entry = files.find((f) => f.isEntry) || files[0];
    if (entry) {
      setActiveFileId(entry.id);
      setOpenFileIds([entry.id]);
    }
  };

  const handleClearConsole = () => {
    setOutput("");
    setError("");
    setExecutionTime(null);
  };

  const handleClearCurrentTab = () => {
    if (activeTab === "output") {
      handleClearConsole();
    } else {
      setInput("");
    }
  };

  // Run execution handler
  const handleRun = useCallback(async () => {
    if (isLoading) return;

    setCurrentView("compiler");
    setIsLoading(true);
    setOutput("");
    setError("");
    setExecutionTime(null);
    setActiveTab("output");

    const startTime = performance.now();

    // Package all project files with their relative paths
    const filesToExecute = allCurrentFiles.map((file) => ({
      path: file.path || file.name,
      content: file.content,
    }));

    const entryFileNode = allCurrentFiles.find((f) => f.isEntry) || allCurrentFiles[0];
    const entryFilePath = entryFileNode ? entryFileNode.path || entryFileNode.name : "";

    try {
      const response = await axios.post(`${API_BASE_URL}/execute`, {
        files: filesToExecute,
        entryFile: entryFilePath,
        input,
        language,
      });

      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);
      setOutput(response.data.output || "");
      setError(response.data.error || "");
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message === "Network Error") {
        setError(
          "NETWORK FAULT: Unable to connect to execution server at http://localhost:3000.\nPlease verify your backend service is running."
        );
      } else {
        setError(err.message || "An unexpected execution fault occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [allCurrentFiles, input, language, isLoading]);

  const runRef = useRef(handleRun);
  useEffect(() => {
    runRef.current = handleRun;
  }, [handleRun]);

  // Global shortcut: Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Resizer drag handler
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const rawPercent = (relativeX / rect.width) * 100;
      const clampedPercent = Math.min(Math.max(rawPercent, 25), 80);
      setSplitRatio(clampedPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      });
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runRef.current();
    });
  };

  const openFileList = allCurrentFiles.filter((f) => openFileIds.includes(f.id));

  return (
    <div className={`workbench-chassis ${isDragging ? "is-resizing" : ""}`}>
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        language={language}
        onLanguageChange={handleLanguageChange}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        isLoading={isLoading}
        onRun={handleRun}
        onResetCode={handleResetProject}
        onClearConsole={handleClearConsole}
      />

      {currentView === "dashboard" ? (
        <main className="dashboard-stage">
          <Dashboard onLaunch={handleLaunchLanguage} activeProjects={projects} />
        </main>
      ) : (
        <main className="workbench-stage" ref={containerRef}>
          <h1 className="sr-only">CodeCraft Online Code Workspace & Compiler</h1>
          {/* File Explorer Sidebar */}
          <FileExplorer
            fileTree={currentTree}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onDeleteNode={handleDeleteNode}
            isOpen={isExplorerOpen}
            onToggleOpen={() => setIsExplorerOpen((prev) => !prev)}
          />

          {/* Editor Zone */}
          <section
            className="editor-zone"
            style={{ width: `${splitRatio}%` }}
            aria-label="Code Editor Zone"
          >
            {/* Editor Tab Bar */}
            <EditorTabBar
              openFiles={openFileList.length > 0 ? openFileList : [activeFile].filter(Boolean)}
              activeFileId={activeFileId}
              onSelectTab={handleSelectFile}
              onCloseTab={handleCloseTab}
              onToggleExplorer={() => setIsExplorerOpen((prev) => !prev)}
              isExplorerOpen={isExplorerOpen}
            />

            <div className="canvas-wrapper">
              {activeFile ? (
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={monacoLanguage}
                  value={activeCode}
                  onChange={handleCodeChange}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontLigatures: true,
                    tabSize: 4,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    renderLineHighlight: "all",
                    roundedSelection: false,
                    automaticLayout: true,
                    cursorBlinking: "phase",
                    cursorWidth: 2,
                    bracketPairColorization: { enabled: true },
                    padding: { top: 10, bottom: 10 },
                  }}
                />
              ) : (
                <div className="editor-empty-state">
                  <p>No file currently open.</p>
                  <p className="empty-sub">Select or create a file in the File Explorer.</p>
                </div>
              )}
            </div>
          </section>

          {/* Resizer Split Gutter */}
          <div
            className="splitter-gutter"
            onMouseDown={() => setIsDragging(true)}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(splitRatio)}
            aria-label="Resize layout divider"
            title="Drag to resize workspace panels"
          >
            <div className="splitter-knurl" />
          </div>

          {/* Console / Output Zone */}
          <div
            className="console-zone-container"
            style={{ width: `${100 - splitRatio}%` }}
          >
            <ConsoleDrawer
              activeTab={activeTab}
              onTabChange={setActiveTab}
              input={input}
              onInputChange={setInput}
              output={output}
              error={error}
              isLoading={isLoading}
              executionTime={executionTime}
              language={language}
              onClear={handleClearCurrentTab}
            />
          </div>
        </main>
      )}

      <StatusBar
        language={language}
        isLoading={isLoading}
        error={error}
        output={output}
        cursorPosition={cursorPosition}
      />
    </div>
  );
}

export default App;
