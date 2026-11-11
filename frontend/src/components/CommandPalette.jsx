import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Code2,
  FileCode,
  Play,
  RotateCcw,
  Sun,
  Moon,
  Trash2,
  FolderTree,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../constants/templates";

export default function CommandPalette({
  isOpen,
  onClose,
  allFiles,
  onSelectFile,
  currentLanguage,
  onSelectLanguage,
  onRun,
  onResetCode,
  onClearConsole,
  theme,
  onToggleTheme,
  onToggleExplorer,
  onViewChange,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build command items
  const commands = [
    {
      id: "action-run",
      title: "Run Code",
      category: "Actions",
      icon: <Play className="w-4 h-4 text-emerald-400" />,
      shortcut: "Ctrl+Enter",
      handler: () => {
        onViewChange("compiler");
        onRun();
        onClose();
      },
    },
    {
      id: "action-toggle-theme",
      title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Appearance",
      icon: theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      shortcut: "Theme",
      handler: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: "action-toggle-explorer",
      title: "Toggle File Explorer",
      category: "View",
      icon: <FolderTree className="w-4 h-4 text-cyan-400" />,
      shortcut: "Ctrl+B",
      handler: () => {
        onToggleExplorer();
        onClose();
      },
    },
    {
      id: "action-clear-console",
      title: "Clear Console Output",
      category: "Actions",
      icon: <Trash2 className="w-4 h-4 text-rose-400" />,
      handler: () => {
        onClearConsole();
        onClose();
      },
    },
    {
      id: "action-reset-workspace",
      title: "Reset Current Project to Default Template",
      category: "Actions",
      icon: <RotateCcw className="w-4 h-4 text-amber-400" />,
      handler: () => {
        onResetCode();
        onClose();
      },
    },
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      category: "Navigation",
      icon: <Terminal className="w-4 h-4 text-purple-400" />,
      handler: () => {
        onViewChange("dashboard");
        onClose();
      },
    },
    {
      id: "nav-editor",
      title: "Open Code Editor Workbench",
      category: "Navigation",
      icon: <Code2 className="w-4 h-4 text-blue-400" />,
      handler: () => {
        onViewChange("compiler");
        onClose();
      },
    },
    // Files
    ...allFiles.map((file) => ({
      id: `file-${file.id}`,
      title: `Open ${file.name}`,
      subtitle: file.path,
      category: "Files",
      icon: <FileCode className="w-4 h-4 text-indigo-400" />,
      handler: () => {
        onViewChange("compiler");
        onSelectFile(file.id);
        onClose();
      },
    })),
    // Languages
    ...SUPPORTED_LANGUAGES.map((lang) => ({
      id: `lang-${lang.id}`,
      title: `Switch Language: ${lang.name}`,
      subtitle: lang.description,
      category: "Languages",
      icon: <span className="text-base leading-none">{lang.icon}</span>,
      active: lang.id === currentLanguage,
      handler: () => {
        onSelectLanguage(lang.id);
        onViewChange("compiler");
        onClose();
      },
    })),
  ];

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation inside command palette
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      scrollIntoView((selectedIndex + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      scrollIntoView((selectedIndex - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].handler();
      }
    }
  };

  const scrollIntoView = (index) => {
    if (!listRef.current) return;
    const item = listRef.current.children[index];
    if (item) {
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="palette-backdrop-wrapper">
          <motion.div
            className="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="palette-dialog"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            onKeyDown={handleKeyDown}
          >
            <div className="palette-search-bar">
              <Search className="palette-search-icon" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search files... (↑↓ to navigate, ↵ to run)"
                className="palette-search-input"
                aria-autocomplete="list"
                aria-controls="palette-results-list"
              />
              <kbd className="palette-kbd-hint">ESC</kbd>
            </div>

            <div
              className="palette-results-list"
              id="palette-results-list"
              ref={listRef}
              role="listbox"
            >
              {filtered.length === 0 ? (
                <div className="palette-empty-state">
                  <p>No matching commands or files found for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                filtered.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isSelected}
                      className={`palette-item ${isSelected ? "is-selected" : ""}`}
                      onClick={() => item.handler()}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="palette-item-left">
                        <span className="palette-item-icon">{item.icon}</span>
                        <div className="palette-item-text">
                          <span className="palette-item-title">{item.title}</span>
                          {item.subtitle && (
                            <span className="palette-item-sub">{item.subtitle}</span>
                          )}
                        </div>
                      </div>

                      <div className="palette-item-right">
                        <span className="palette-category-badge">{item.category}</span>
                        {item.shortcut && (
                          <kbd className="palette-shortcut-badge">{item.shortcut}</kbd>
                        )}
                        {isSelected && <ArrowRight className="palette-select-arrow" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="palette-footer">
              <div className="palette-footer-hint">
                <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                <span><kbd>↵</kbd> select</span>
                <span><kbd>esc</kbd> close</span>
              </div>
              <div className="palette-footer-tag">CodeCraft Studio</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

