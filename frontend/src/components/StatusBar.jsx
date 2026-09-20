export default function StatusBar({
  language,
  isLoading,
  error,
  output,
  cursorPosition,
}) {
  const getStatus = () => {
    if (isLoading) {
      return {
        label: "CONTAINER RUNNING",
        stateClass: "state-active",
      };
    }
    if (error) {
      return {
        label: "RUNTIME FAULT",
        stateClass: "state-fault",
      };
    }
    if (output) {
      return {
        label: "PROCESS COMPLETE",
        stateClass: "state-success",
      };
    }
    return {
      label: "IDLE / READY",
      stateClass: "state-idle",
    };
  };

  const status = getStatus();

  return (
    <footer className="telemetry-bar" aria-label="System Telemetry">
      <div className="telemetry-left">
        <div className="telemetry-node">
          <span className={`signal-light ${status.stateClass}`} />
          <span className="telemetry-label">{status.label}</span>
        </div>

        <span className="telemetry-pipe">|</span>

        <div className="telemetry-node">
          <span className="telemetry-meta">
            RUNTIME: {language === "python" ? "PYTHON_3" : "OPENJDK_17"}
          </span>
        </div>
      </div>

      <div className="telemetry-right">
        {cursorPosition && (
          <>
            <div className="telemetry-node">
              <span>
                LN {cursorPosition.lineNumber}, COL {cursorPosition.column}
              </span>
            </div>
            <span className="telemetry-pipe">|</span>
          </>
        )}

        <div className="telemetry-node">
          <span>UTF-8</span>
        </div>

        <span className="telemetry-pipe">|</span>

        <div className="telemetry-node hotkey-guidance">
          <span>RUN:</span> <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
        </div>
      </div>
    </footer>
  );
}
