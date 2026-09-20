// backend/utils/security.js
// Rate limiting, concurrency semaphore, and payload validation

// In-memory IP rate limiter: max 20 requests per minute
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

// Periodic cleanup of stale rate limiter entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
      ipRequestCounts.delete(ip);
    }
  }
}, 60 * 1000).unref();

const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    ipRequestCounts.set(ip, { startTime: now, count: 1 });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil(
      (record.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
};

// Concurrency Semaphore: max 5 concurrent executions, queue limit 10
const MAX_CONCURRENT_JOBS = 5;
const MAX_QUEUE_DEPTH = 10;
let activeJobCount = 0;
const jobQueue = [];

const acquireExecutionSlot = () => {
  return new Promise((resolve, reject) => {
    if (activeJobCount < MAX_CONCURRENT_JOBS) {
      activeJobCount += 1;
      resolve();
      return;
    }

    if (jobQueue.length >= MAX_QUEUE_DEPTH) {
      reject(new Error("Server is currently at maximum capacity. Please retry shortly."));
      return;
    }

    jobQueue.push({ resolve, reject, queuedAt: Date.now() });
  });
};

const releaseExecutionSlot = () => {
  if (jobQueue.length > 0) {
    const nextJob = jobQueue.shift();
    nextJob.resolve();
  } else {
    activeJobCount = Math.max(0, activeJobCount - 1);
  }
};

// Path Traversal and Filename Sanitization
const isValidPath = (filePath) => {
  if (typeof filePath !== "string" || !filePath.trim()) return false;
  const normalized = filePath.replace(/\\/g, "/").trim();

  // Prevent path traversal
  if (
    normalized.includes("..") ||
    normalized.startsWith("/") ||
    normalized.startsWith("./") ||
    normalized.includes(":")
  ) {
    return false;
  }

  // Allow only safe alphanumeric characters, underscores, dashes, dots, and directory slashes
  const validPathRegex = /^[a-zA-Z0-9_\-\.\/]+$/;
  return validPathRegex.test(normalized);
};

// Payload Validation
const validateExecutionPayload = (body) => {
  const { code, files, entryFile, language, input = "" } = body;

  const SUPPORTED_LANGUAGES = ["python", "java", "javascript", "cpp", "c"];
  if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
    return {
      isValid: false,
      error: `Unsupported or missing language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
    };
  }

  if (typeof input !== "string" || input.length > 10000) {
    return {
      isValid: false,
      error: "Input payload exceeds maximum allowed size (10,000 characters).",
    };
  }

  // Multi-file validation
  if (files) {
    if (typeof files !== "object" || files === null) {
      return { isValid: false, error: "Files property must be an object or array." };
    }

    const fileEntries = Array.isArray(files)
      ? files.map((f) => [f.path, f.content])
      : Object.entries(files);

    if (fileEntries.length === 0) {
      return { isValid: false, error: "Project must contain at least one file." };
    }

    if (fileEntries.length > 20) {
      return { isValid: false, error: "Project exceeds maximum file count limit (20 files)." };
    }

    let totalChars = 0;
    for (const [pathKey, content] of fileEntries) {
      if (!isValidPath(pathKey)) {
        return {
          isValid: false,
          error: `Security exception: Illegal or traversing file path '${pathKey}'.`,
        };
      }

      if (typeof content !== "string") {
        return { isValid: false, error: `Invalid content for file '${pathKey}'.` };
      }

      totalChars += content.length;
      if (content.length > 50000 || totalChars > 100000) {
        return {
          isValid: false,
          error: "Project exceeds maximum allowed code size (100,000 characters total).",
        };
      }
    }

    if (entryFile && !isValidPath(entryFile)) {
      return { isValid: false, error: `Illegal entry file path '${entryFile}'.` };
    }

    return { isValid: true, isMultiFile: true, fileEntries, entryFile };
  }

  // Single file validation
  if (!code || typeof code !== "string") {
    return { isValid: false, error: "Code is required and must be a string." };
  }

  if (code.length > 50000) {
    return { isValid: false, error: "Code exceeds maximum size (50,000 characters)." };
  }

  return { isValid: true, isMultiFile: false };
};

module.exports = {
  checkRateLimit,
  acquireExecutionSlot,
  releaseExecutionSlot,
  validateExecutionPayload,
  isValidPath,
};
