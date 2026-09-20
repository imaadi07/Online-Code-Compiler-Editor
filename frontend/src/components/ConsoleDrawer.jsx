import { useState } from "react";

export default function ConsoleDrawer({
  activeTab,
  onTabChange,
  input,
  onInputChange,
  output,
  error,
  isLoading,
  executionTime,
  language,
  onClear,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = error ? `${output}\n\n[Error]:\n${error}` : output;
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
  const shellCommand =
    language === "python"
      ? "python3 main.py"
      : language === "java"
      ? "javac $(find . -name '*.java') && java Main"
      : language === "javascript"
      ? "node index.js"
      : language === "cpp"
      ? "g++ -O2 $(find . -name '*.cpp') -o prog && ./prog"
      : "gcc -O2 $(find . -name '*.c') -o prog && ./prog";

  return (
    <section className="console-drawer" aria-label="Terminal and Stdin Console" id="console-drawer-section">
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
            <span className="tab-icon">❯_</span>
            <span>Console</span>
            {error && <span className="badge badge-error">exit 1</span>}
            {!error && output && <span className="badge badge-success">exit 0</span>}
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
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="12" x2="10" y2="12" />
            </svg>
            <span>Stdin</span>
            {hasInput && <span className="badge badge-indicator" title="Stdin provided" />}
          </button>
        </div>

        <div className="console-toolbar-right">
          {executionTime !== null && !isLoading && (
            <span className="metric-badge" title="Execution duration" id="execution-time-badge">
              <span className="metric-dot" />
              {executionTime} ms
            </span>
          )}

          {activeTab === "output" && hasOutput && (
            <button
              type="button"
              id="btn-copy-output"
              onClick={handleCopy}
              className="action-pill-btn"
              title="Copy output to clipboard"
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
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
            title={activeTab === "output" ? "Clear terminal buffer" : "Clear stdin"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>{activeTab === "output" ? "Clear" : "Reset Stdin"}</span>
          </button>
        </div>
      </div>

      {/* Terminal View Body */}
      <div className="console-body">
        {activeTab === "output" && (
          <div className="tab-pane output-pane" role="tabpanel" id="panel-console-output" aria-labelledby="tab-btn-output">
            {/* Shell Session Command Bar */}
            <div className="shell-command-bar">
              <span className="shell-prompt">$</span>
              <span className="shell-cmd-text">{shellCommand}</span>
              {isLoading && <span className="shell-cursor" />}
            </div>

            {isLoading ? (
              <div className="terminal-loading-state">
                <div className="industrial-spinner" />
                <span className="loading-label">Executing in container environment...</span>
              </div>
            ) : !hasOutput ? (
              <div className="terminal-empty-state">
                <p className="empty-title">Process Idle</p>
                <p className="empty-subtitle">
                  No execution trace. Trigger <strong>Run Code</strong> or press <kbd>Ctrl+Enter</kbd> to execute.
                </p>
              </div>
            ) : (
              <div className="terminal-stream">
                {output && (
                  <div className="stream-section stdout-section">
                    <pre className="stdout-pre" id="terminal-stdout">{output}</pre>
                  </div>
                )}
                {error && (
                  <div className="stream-section stderr-section">
                    <div className="stderr-header">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>Execution Diagnostic:</span>
                    </div>
                    <pre className="stderr-pre" id="terminal-stderr">{error}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "input" && (
          <div className="tab-pane input-pane" role="tabpanel" id="panel-console-stdin" aria-labelledby="tab-btn-input">
            <div className="stdin-meta-bar">
              <span className="meta-text">
                Standard Input Buffer (feeds into <code>input()</code> / <code>Scanner</code>)
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
              placeholder={`# Provide lines of standard input here:\ne.g.\n42\nHello World`}
              spellCheck="false"
              aria-label="Standard Input Buffer"
            />
          </div>
        )}
      </div>
    </section>
  );
}
