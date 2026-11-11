import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Play,
  Layers,
  Cpu,
  ShieldCheck,
  Terminal,
  Zap,
  ArrowRight,
  Code2,
  FolderTree,
  Command,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileCode,
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../constants/templates";

// Mini demo codes for the Hero interactive preview
const DEMO_PREVIEWS = {
  python: {
    lang: "Python 3.10",
    file: "main.py",
    code: `# Multi-File Algorithm Execution
from algorithms.sort import quick_sort

data = [42, 17, 89, 5, 63, 28, 91]
sorted_data = quick_sort(data)

print(f"Original: {data}")
print(f"Sorted:   {sorted_data}")
print("Status: Pipeline executed in 18ms.")`,
    output: `Original: [42, 17, 89, 5, 63, 28, 91]
Sorted:   [5, 17, 28, 42, 63, 89, 91]
Status: Pipeline executed in 18ms.
Process finished with exit code 0`,
  },
  javascript: {
    lang: "Node.js 20",
    file: "index.js",
    code: `// Multi-Module Computational Graph
const { computeStats } = require("./lib/stats");

const dataset = [12.4, 45.2, 88.9, 31.7, 94.1];
const stats = computeStats(dataset);

console.log("Mean:", stats.mean.toFixed(2));
console.log("Standard Deviation:", stats.stdDev.toFixed(2));`,
    output: `Mean: 54.46
Standard Deviation: 31.28
Process finished with exit code 0`,
  },
  cpp: {
    lang: "C++ 17 (g++)",
    file: "main.cpp",
    code: `// High-Performance Vector Processing
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int total = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "Computed Vector Sum: " << total << std::endl;
    return 0;
}`,
    output: `Starting C++ execution...
Computed Vector Sum: 150
Process finished with exit code 0`,
  },
};

export default function Dashboard({ onLaunch }) {
  const [activePreviewKey, setActivePreviewKey] = useState("python");
  const [simulatedRunning, setSimulatedRunning] = useState(false);
  const [previewOutput, setPreviewOutput] = useState(DEMO_PREVIEWS.python.output);

  const handleSimulateRun = () => {
    setSimulatedRunning(true);
    setPreviewOutput("Initializing isolated container...\nCompiling code...");
    setTimeout(() => {
      setSimulatedRunning(false);
      setPreviewOutput(DEMO_PREVIEWS[activePreviewKey].output);
    }, 600);
  };

  const handleSwitchPreview = (key) => {
    setActivePreviewKey(key);
    setPreviewOutput(DEMO_PREVIEWS[key].output);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Hero Section */}
        <motion.section
          className="dashboard-hero"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Animated Ambient Glow */}
          <div className="hero-radial-mesh" aria-hidden="true" />

          <motion.div className="hero-badge" variants={itemVariants}>
            <span className="hero-badge-dot" aria-hidden="true">
              <span className="hero-badge-pulse" />
            </span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Generation Multi-File Cloud Compiler</span>
          </motion.div>

          <motion.h1 className="hero-title" variants={itemVariants}>
            Architect, edit, and run code <br />
            <span className="text-gradient">with zero environment setup.</span>
          </motion.h1>

          <motion.p className="hero-description" variants={itemVariants}>
            An enterprise-grade online development environment designed for developers,
            students, and educators. Build multi-file projects in Python, Java, C++, C, and JavaScript
            with instantaneous sandboxed execution, real-time terminal streams, and pro Monaco keybindings.
          </motion.p>

          <motion.div className="hero-action-row" variants={itemVariants}>
            <button
              type="button"
              onClick={() => onLaunch("python")}
              className="hero-primary-btn"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Cloud Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a href="#runtimes-section" className="hero-secondary-btn">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Explore 5 Runtimes</span>
            </a>
          </motion.div>

          {/* Interactive Live Hero Code Preview Card */}
          <motion.div className="hero-preview-stage" variants={itemVariants}>
            <div className="hero-preview-window">
              <div className="preview-window-header">
                <div className="window-dots" aria-hidden="true">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>

                <div className="preview-lang-pills">
                  {Object.keys(DEMO_PREVIEWS).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`preview-pill ${activePreviewKey === k ? "is-active" : ""}`}
                      onClick={() => handleSwitchPreview(k)}
                    >
                      {DEMO_PREVIEWS[k].lang}
                    </button>
                  ))}
                </div>

                <div className="preview-header-actions">
                  <button
                    type="button"
                    onClick={handleSimulateRun}
                    disabled={simulatedRunning}
                    className="preview-run-button"
                    title="Simulate quick execution"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{simulatedRunning ? "Running..." : "Test Run"}</span>
                  </button>
                </div>
              </div>

              <div className="preview-window-body">
                {/* Code Panel */}
                <div className="preview-code-pane">
                  <div className="pane-sub-header">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{DEMO_PREVIEWS[activePreviewKey].file}</span>
                  </div>
                  <pre className="preview-code-block">
                    <code>{DEMO_PREVIEWS[activePreviewKey].code}</code>
                  </pre>
                </div>

                {/* Simulated Output Panel */}
                <div className="preview-output-pane">
                  <div className="pane-sub-header">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Terminal Stream (Preview)</span>
                  </div>
                  <pre className="preview-output-block">
                    <code>{previewOutput}</code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Runtime Environments Matrix */}
        <section className="runtimes-section" id="runtimes-section" aria-labelledby="runtimes-heading">
          <div className="section-header">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="section-badge">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pre-Warmed Execution Environments</span>
              </div>
              <h2 id="runtimes-heading" className="section-title">
                Supported Language Engines
              </h2>
              <p className="section-subtitle">
                Select a language environment to launch a multi-file project preconfigured with standard entry points and modular helper imports.
              </p>
            </motion.div>
          </div>

          <div className="runtimes-grid">
            {SUPPORTED_LANGUAGES.map((lang, index) => {
              return (
                <motion.article
                  key={lang.id}
                  className="runtime-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <div className="runtime-card-glow" aria-hidden="true" />

                  <div className="runtime-card-top">
                    <div className="runtime-icon-wrapper" aria-hidden="true">
                      <span className="runtime-icon">{lang.icon}</span>
                    </div>
                    <div className="runtime-meta">
                      <div className="runtime-header-row">
                        <h3 className="runtime-name">{lang.name}</h3>
                        <span className="file-badge">Multi-file</span>
                      </div>
                      <span className="runtime-spec">{lang.description}</span>
                    </div>
                  </div>

                  {/* Starter File Structure Preview Chips */}
                  <div className="runtime-files-preview">
                    <span className="files-preview-label">Boilerplate Tree:</span>
                    <div className="files-chip-list">
                      {lang.initialFiles.map((file) => (
                        <span key={file.id} className="file-chip">
                          <span className="file-chip-icon">
                            {file.type === "folder" ? "📁" : "📄"}
                          </span>
                          <span className="file-chip-name">{file.name}</span>
                          {file.isEntry && <span className="entry-tag">Entry</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="runtime-card-footer">
                    <button
                      type="button"
                      onClick={() => onLaunch(lang.id)}
                      className="launch-btn"
                      aria-label={`Launch ${lang.name} Workspace`}
                    >
                      <span>Start Coding in {lang.name}</span>
                      <ChevronRight className="launch-chevron" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* Security & Sandbox Architecture Visualizer */}
        <motion.section
          className="architecture-showcase-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          aria-labelledby="architecture-heading"
        >
          <div className="architecture-inner">
            <div className="architecture-header">
              <div className="section-badge">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Isolated Security Sandbox</span>
              </div>
              <h2 id="architecture-heading" className="architecture-title">
                Ephemeral Container Isolation
              </h2>
              <p className="architecture-desc">
                Every code execution spawns a transient, hardened sandbox with zero access to the host
                system, no network privileges, and strictly enforced resource bounds.
              </p>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="arch-flow-diagram">
              <div className="arch-node">
                <div className="node-icon bg-indigo">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="node-info">
                  <h4>1. Code Dispatch</h4>
                  <p>Multi-file JSON payload with entry-point mapping</p>
                </div>
              </div>

              <div className="arch-connector">
                <div className="connector-line" />
                <span className="connector-arrow">→</span>
              </div>

              <div className="arch-node">
                <div className="node-icon bg-cyan">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="node-info">
                  <h4>2. Hardened Sandbox</h4>
                  <p>100MB RAM cap, 1 CPU core, tmpfs write mounts</p>
                </div>
              </div>

              <div className="arch-connector">
                <div className="connector-line" />
                <span className="connector-arrow">→</span>
              </div>

              <div className="arch-node">
                <div className="node-icon bg-emerald">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="node-info">
                  <h4>3. Real-Time Telemetry</h4>
                  <p>Sub-second output streaming with exit code tracking</p>
                </div>
              </div>
            </div>

            {/* Stat Counters Grid */}
            <div className="arch-stats-grid">
              <div className="stat-card">
                <span className="stat-number">&lt; 250ms</span>
                <span className="stat-label">Cold-Start Dispatch</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">100 MB</span>
                <span className="stat-label">Memory Limit Per Run</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">5.0s</span>
                <span className="stat-label">Execution Timeout Safety</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">100%</span>
                <span className="stat-label">Network-Disabled Sandbox</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Studio Capabilities Grid */}
        <section className="features-showcase-section" aria-labelledby="features-heading">
          <div className="section-header">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="section-badge">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Engineered for Velocity</span>
              </div>
              <h2 id="features-heading" className="section-title">
                Built for Fluid Problem Solving
              </h2>
              <p className="section-subtitle">
                Everything you need to write algorithms, modular data structures, or debug multi-file systems.
              </p>
            </motion.div>
          </div>

          <div className="features-grid">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4 }}
            >
              <div className="feature-icon-box">
                <FolderTree className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="feature-title">Multi-File Workspace</h3>
              <p className="feature-text">
                Create nested folder trees, import local modules across files, and designate custom
                entry points without managing complex build tools or bundlers.
              </p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="feature-icon-box">
                <Command className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="feature-title">Quick Command Palette</h3>
              <p className="feature-text">
                Press <code>⌘K</code> or <code>Ctrl+K</code> to instantly search through your files,
                switch language runtimes, run code, or toggle themes in milliseconds.
              </p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="feature-icon-box">
                <Terminal className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="feature-title">Interactive Stdin Buffer</h3>
              <p className="feature-text">
                Provide custom test cases and input lines directly into the dedicated Stdin stream.
                Seamlessly test competitive programming problems and interactive console programs.
              </p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="feature-icon-box">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="feature-title">Full WCAG 2.1 AA Compliance</h3>
              <p className="feature-text">
                Engineered with high contrast ratios (&gt; 4.5:1), screen-reader live announcements,
                keyboard navigable tree controls, and dual dark/light theme support.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Keyboard Shortcuts Reference Bar */}
        <motion.section
          className="shortcuts-reference-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4 }}
          aria-label="Keyboard Shortcuts"
        >
          <div className="shortcuts-bar-inner">
            <span className="shortcuts-title">Keyboard Shortcuts:</span>
            <div className="shortcuts-list">
              <span className="shortcut-item">
                <kbd>Ctrl+Enter</kbd> <span>Run Code</span>
              </span>
              <span className="shortcut-item">
                <kbd>Ctrl+K</kbd> <span>Command Palette</span>
              </span>
              <span className="shortcut-item">
                <kbd>Ctrl+B</kbd> <span>Toggle Explorer</span>
              </span>
              <span className="shortcut-item">
                <kbd>Esc</kbd> <span>Close Overlays</span>
              </span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
