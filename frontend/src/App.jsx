// App.jsx
import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "./App.css";

function App() {
  const editorRef = useRef();
  const [code, setCode] = useState("# Write your Python code here");
  const [language, setLanguage] = useState("python");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);

    if (lang === "python") {
      setCode("# Write your Python code here");
    } else {
      setCode(`public class Main {
  public static void main(String[] args) {
    System.out.println("Hello from Java!");
  }
}`);
    }
  };

  const handleRun = async () => {
    setOutput("");
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/execute", {
        code,
        input,
        language,
      });

      setOutput(response.data.output);
      setError(response.data.error);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="main-container">
      <div className="body">
        <div className="heading-box">
          <h1 className="heading">Online Code Editor</h1>
        </div>

        {/* Language Selector */}
        <div className="utility-box">
          <div className="lang-selector-box">
            <label className="lang-label">Language: </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="lang-button"
            >
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          <button onClick={handleRun} className="run-button">
            Run Code
          </button>
        </div>

        <div className="code-box">
          <Editor
            className="editor"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(value) => setCode(value)}
            onMount={(editor) => (editorRef.current = editor)}
          />

          <div className="code-output-box">
            <div className="input-box">
              <label>Input:</label>
              <textarea
                rows="4"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input values (if any)"
              />
            </div>

            <div className="output-box">
              <h2>Output:</h2>
              <pre>{output}</pre>
              {error && (
                <>
                  <h2 style={{ color: "red" }}>Error:</h2>
                  <pre>{error}</pre>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
