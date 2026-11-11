import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Terminal,
  FileInput,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ConsoleDrawer({
  activeTab,
  onTabChange,
  input,
  onInputChange,
  output,
  error,
  isLoading,
  executionTime,
  onClear,
}) {
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti on success!
  useEffect(() => {
    if (output && !error && !isLoading) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.85, x: 0.8 },
        colors: ["#06b6d4", "#10b981", "#6366f1", "#f59e0b"],
        disableForReducedMotion: true,
      });
    }
  }, [output, error, isLoading]);

  const handleCopy = async () => {
    const textToCopy = error ? `${output}\n\n[Error]:\n${error}`.trim() : output;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const hasOutput = Boolean(output || error);
  const hasInput = Boolean(input.trim());

  return (
    <section
      className="console-drawer"
      aria-label="Terminal and Output Console"
      id="console-drawer-section"
    >
      {/* Tab Navigation Deck */}
      <div className="console-tabs" role="tablist" id="console-tab-list">
        <div className="tab-group">
          <button
            type="button"
            role="tab"
            id="tab-btn-output"
            aria-selected={activeTab === "output"}
            aria-controls="panel-console-output"
            className={`tab-btn ${activeTab === "output" ? "active" : ""}`}
            onClick={() => onTabChange("output")}
          >
            <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Terminal</span>
            {error && (
              <span className="badge badge-error">
                <AlertTriangle className="w-3 h-3" /> Error
              </span>
            )}
            {!error && output && (
              <span className="badge badge-success">
                <CheckCircle2 className="w-3 h-3" /> Success
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            id="tab-btn-input"
            aria-selected={activeTab === "input"}
            aria-controls="panel-console-stdin"
            className={`tab-btn ${activeTab === "input" ? "active" : ""}`}
            onClick={() => onTabChange("input")}
          >
            <FileInput className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Input (Stdin)</span>
            {hasInput && (
              <span className="badge badge-indicator" title="Standard input provided">
                Active
              </span>
            )}
          </button>
        </div>

        <div className="console-toolbar-right">
          {executionTime !== null && !isLoading && (
            <span
              className="metric-badge"
              title="Execution time in milliseconds"
              id="execution-time-badge"
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{executionTime} ms</span>
            </span>
          )}

          {activeTab === "output" && hasOutput && (
            <button
              type="button"
              id="btn-copy-output"
              onClick={handleCopy}
              className="action-pill-btn"
              title="Copy output to clipboard"
              aria-label="Copy output to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            id="btn-clear-console"
            onClick={onClear}
            className="action-pill-btn"
            title={activeTab === "output" ? "Clear output" : "Reset input"}
            aria-label={activeTab === "output" ? "Clear output" : "Reset input"}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{activeTab === "output" ? "Clear" : "Reset"}</span>
          </button>
        </div>
      </div>

      {/* Terminal View Body */}
      <div className="console-body">
        {activeTab === "output" && (
          <div
            className="tab-pane output-pane"
            role="tabpanel"
            id="panel-console-output"
            aria-labelledby="tab-btn-output"
          >
            {isLoading ? (
              <div className="terminal-loading-state" role="status">
                <div className="cosmic-spinner" aria-hidden="true">
                  <div className="spinner-core" />
                </div>
                <div className="loading-text-cluster">
                  <span className="loading-label">Executing in isolated micro-sandbox...</span>
                  <span className="loading-sub">Allocating CPU quota & memory limits</span>
                </div>
              </div>
            ) : !hasOutput ? (
              <div className="terminal-empty-state">
                <div className="terminal-prompt-icon" aria-hidden="true">
                  <Sparkles className="w-6 h-6 text-cyan-400 opacity-60" />
                </div>
                <p className="empty-title">Sandbox ready for execution</p>
                <p className="empty-subtitle">
                  Click <strong>Run Code</strong> or press <kbd>⌘+Enter</kbd> / <kbd>Ctrl+Enter</kbd> to execute.
                </p>
                <div className="terminal-cli-hint">
                  <code>guest@codecraft-sandbox:~$ _</code>
                </div>
              </div>
            ) : (
              <div className="terminal-stream" role="region" aria-label="Program Output">
                {output && (
                  <div className="stream-section stdout-section">
                    <pre className="stdout-pre" id="terminal-stdout">{output}</pre>
                  </div>
                )}
                {error && (
                  <div className="stream-section stderr-section" role="alert">
                    <div className="stderr-header">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Execution Fault / Diagnostics:</span>
                    </div>
                    <pre className="stderr-pre" id="terminal-stderr">{error}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "input" && (
          <div
            className="tab-pane input-pane"
            role="tabpanel"
            id="panel-console-stdin"
            aria-labelledby="tab-btn-input"
          >
            <div className="stdin-meta-bar">
              <span className="meta-text">
                Standard Input Buffer (passed to <code>cin</code>, <code>Scanner</code>, or <code>input()</code>)
              </span>
              <span className="meta-counter">
                {input ? input.split("\n").length : 0} {input.split("\n").length === 1 ? "line" : "lines"}
              </span>
            </div>
            <textarea
              id="stdin-textarea"
              className="stdin-textarea"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={`# Type standard input lines here before clicking Run:\n# e.g.\n42\nDeveloper\n`}
              spellCheck="false"
              aria-label="Standard Input Buffer"
            />
          </div>
        )}
      </div>
    </section>
  );
}
