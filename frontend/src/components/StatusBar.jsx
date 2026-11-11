import { ShieldCheck, Cpu, Terminal, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../constants/templates";

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
        label: "Executing...",
        stateClass: "state-active",
        icon: <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />,
      };
    }
    if (error) {
      return {
        label: "Fault Occurred",
        stateClass: "state-fault",
        icon: <AlertTriangle className="w-3 h-3 text-rose-400" />,
      };
    }
    if (output) {
      return {
        label: "Completed 0 Errors",
        stateClass: "state-success",
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
      };
    }
    return {
      label: "Sandbox Standby",
      stateClass: "state-idle",
      icon: <ShieldCheck className="w-3 h-3 text-cyan-400" />,
    };
  };

  const status = getStatus();
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.id === language);
  const langLabel = langObj ? langObj.name : language;

  return (
    <footer className="telemetry-bar" role="contentinfo" aria-label="Editor Status Bar">
      <div className="telemetry-left">
        <div className="telemetry-node">
          {status.icon}
          <span className={`signal-light ${status.stateClass}`} aria-hidden="true" />
          <span className="telemetry-label">{status.label}</span>
        </div>

        <span className="telemetry-pipe" aria-hidden="true">|</span>

        <div className="telemetry-node">
          <Cpu className="w-3 h-3 text-muted" />
          <span>{langLabel}</span>
        </div>

        <span className="telemetry-pipe" aria-hidden="true">|</span>

        <div className="telemetry-node">
          <Terminal className="w-3 h-3 text-muted" />
          <span>Docker Sandbox Active</span>
        </div>
      </div>

      <div className="telemetry-right">
        {cursorPosition && (
          <>
            <div className="telemetry-node">
              <span>
                Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
              </span>
            </div>
            <span className="telemetry-pipe" aria-hidden="true">|</span>
          </>
        )}

        <div className="telemetry-node">
          <span>UTF-8</span>
        </div>

        <span className="telemetry-pipe" aria-hidden="true">|</span>

        <div className="telemetry-node hotkey-guidance">
          <span>Run:</span> <kbd>⌘↵</kbd>
        </div>

        <span className="telemetry-pipe" aria-hidden="true">|</span>

        <div className="telemetry-node hotkey-guidance">
          <span>Commands:</span> <kbd>⌘K</kbd>
        </div>
      </div>
    </footer>
  );
}
