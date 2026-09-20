import { SUPPORTED_LANGUAGES } from "../constants/templates";

export default function Dashboard({ onLaunch, activeProjects }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Hero Section */}
        <section className="dashboard-hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Developer Workbench • Multi-Language & Multi-File</span>
          </div>
          <h1 className="hero-title">Your scratchpad for clean, rapid code.</h1>
          <p className="hero-description">
            Build modular projects with files and folders, test algorithms, and execute in an isolated,
            hardened execution sandbox. No local compiler installations, configuration files, or environment overhead required.
          </p>
        </section>

        {/* Runtime Environment Cards Grid */}
        <section className="runtimes-section">
          <div className="section-header">
            <h2 className="section-title">Select Runtime Environment</h2>
            <span className="section-subtitle">
              Choose an environment below to launch a multi-file workspace
            </span>
          </div>

          <div className="runtimes-grid">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const projectTree = activeProjects?.[lang.id] || lang.initialFiles;

              // Find entry file in tree
              const findEntryFile = (nodes) => {
                for (const node of nodes) {
                  if (node.type === "file" && node.isEntry) return node;
                  if (node.type === "folder" && node.children) {
                    const found = findEntryFile(node.children);
                    if (found) return found;
                  }
                }
                return nodes.find((n) => n.type === "file") || null;
              };

              const entry = findEntryFile(projectTree);
              const previewContent = entry ? entry.content : "";
              const previewLines = previewContent.trim().split("\n");

              return (
                <div key={lang.id} className="runtime-card">
                  <div className="runtime-card-top">
                    <div className="runtime-icon-wrapper">
                      <span className="runtime-icon">{lang.icon}</span>
                    </div>
                    <div className="runtime-meta">
                      <div className="runtime-header-row">
                        <h3 className="runtime-name">{lang.name}</h3>
                        <span className="file-badge">Multi-File</span>
                      </div>
                      <span className="runtime-spec">{lang.description}</span>
                    </div>
                  </div>

                  <p className="runtime-summary">
                    Includes entry point <code>{lang.defaultEntry}</code> plus modular subfolder scaffolding ready for imports and compilation.
                  </p>

                  <div className="runtime-preview-box">
                    <div className="preview-top-bar">
                      <span className="preview-filename">{entry ? entry.name : lang.defaultEntry}</span>
                      <span className="preview-lines">{previewLines.length} lines</span>
                    </div>
                    <pre className="preview-code">
                      {previewLines.slice(0, 4).join("\n")}
                      {previewLines.length > 4 ? "\n..." : ""}
                    </pre>
                  </div>

                  <div className="runtime-card-footer">
                    <button
                      type="button"
                      onClick={() => onLaunch(lang.id)}
                      className="launch-btn"
                    >
                      <span>Launch {lang.name} Workspace</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Technical Specs & Workflow Shortcuts */}
        <section className="specs-section">
          <div className="specs-card">
            <div className="spec-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h3>Hardened Sandbox & Host Defenses</h3>
            </div>
            <ul className="spec-list">
              <li>
                <strong>Network Isolation:</strong> Zero network access (SSRF & reverse-shell proof).
              </li>
              <li>
                <strong>Process Limits:</strong> Strict process ceiling (64 PIDs) eliminates fork bombs.
              </li>
              <li>
                <strong>Memory Bounds:</strong> 256MB hard limit protects host resources from OOM crashes.
              </li>
              <li>
                <strong>Ephemeral Directory:</strong> Each execution runs in a dedicated subfolder that is purged immediately after exit.
              </li>
            </ul>
          </div>

          <div className="specs-card">
            <div className="spec-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d5cf6" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M6 12h.001M10 12h.001M14 12h.001M18 12h.001M8 16h8" />
              </svg>
              <h3>Workspace Capabilities</h3>
            </div>
            <ul className="shortcuts-list">
              <li className="shortcut-row">
                <span className="shortcut-action">Compile & Execute</span>
                <span className="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></span>
              </li>
              <li className="shortcut-row">
                <span className="shortcut-action">Create Files & Folders</span>
                <span className="shortcut-desc">Explorer sidebar actions</span>
              </li>
              <li className="shortcut-row">
                <span className="shortcut-action">Tabbed Multi-File Editing</span>
                <span className="shortcut-desc">Click file in Explorer</span>
              </li>
              <li className="shortcut-row">
                <span className="shortcut-action">Adjust Workspace Split</span>
                <span className="shortcut-desc">Drag middle divider</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
