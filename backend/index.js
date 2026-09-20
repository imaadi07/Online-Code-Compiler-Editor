require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { executeCode } = require("./utils/executor");
const {
  checkRateLimit,
  acquireExecutionSlot,
  releaseExecutionSlot,
  validateExecutionPayload,
} = require("./utils/security");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Strict request body size limit to prevent memory flooding attacks
app.use(express.json({ limit: "100kb" }));

// Root health & diagnostic check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.post("/execute", async (req, res) => {
  const clientIp =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

  // 1. IP Rate Limiting Guard
  const rateLimitResult = checkRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      output: "",
      error: `Rate limit exceeded. Please wait ${rateLimitResult.retryAfterSeconds} seconds before re-running code.`,
    });
  }

  // 2. Payload & Path Traversal Validation Guard
  const validation = validateExecutionPayload(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ output: "", error: validation.error });
  }

  // 3. Concurrency Semaphore Guard (Max 5 concurrent, 10 queued)
  try {
    await acquireExecutionSlot();
  } catch (capacityErr) {
    return res.status(429).json({
      output: "",
      error: capacityErr.message,
    });
  }

  try {
    const { isMultiFile, fileEntries, entryFile } = validation;
    const { code, input = "", language } = req.body;

    const output = await executeCode({
      code: isMultiFile ? undefined : code,
      fileEntries: isMultiFile ? fileEntries : undefined,
      entryFile,
      input,
      language,
    });

    res.json({ output, error: "" });
  } catch (err) {
    res.status(500).json({ output: "", error: err.message });
  } finally {
    // Release semaphore slot back to pool
    releaseExecutionSlot();
  }
});

app.listen(port, () => {
  console.log(`Hardened compiler server active at http://localhost:${port}`);
});
