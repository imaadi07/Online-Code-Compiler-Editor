// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { executeCode } = require("./utils/executor");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/execute", async (req, res) => {
  const { code, input = "", language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  if (!["python", "java"].includes(language)) {
    return res
      .status(400)
      .json({ error: 'Unsupported language. Use "python" or "java"' });
  }

  try {
    const output = await executeCode(code, input, language);
    // console.log(output);
    res.json({ output, error: "" });
  } catch (err) {
    res.status(500).json({ output: "", error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
