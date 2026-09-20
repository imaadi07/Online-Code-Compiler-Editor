require("dotenv").config();
const Docker = require("dockerode");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const docker = new Docker({
  host: process.env.DOCKER_HOST || "127.0.0.1",
  port: process.env.DOCKER_PORT ? parseInt(process.env.DOCKER_PORT) : 2375,
});

const MAX_OUTPUT_BYTES = 64 * 1024; // 64 KB stream cap

const cleanOutput = (data) => {
  return data
    .toString("utf8")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .trim();
};

const LANGUAGE_CONFIGS = {
  python: {
    image: "python:3.8-slim",
    defaultEntry: "main.py",
    getCmd: (entry) => ["sh", "-c", `python "${entry || "main.py"}" < input.txt`],
  },
  java: {
    image: "openjdk:11",
    defaultEntry: "Main.java",
    getCmd: () => [
      "sh",
      "-c",
      `javac $(find . -name "*.java") && java Main < input.txt`,
    ],
  },
  javascript: {
    image: "node:18-alpine",
    defaultEntry: "index.js",
    getCmd: (entry) => ["sh", "-c", `node "${entry || "index.js"}" < input.txt`],
  },
  cpp: {
    image: "gcc:latest",
    defaultEntry: "main.cpp",
    getCmd: () => [
      "sh",
      "-c",
      `g++ -O2 $(find . -name "*.cpp") -o prog && ./prog < input.txt`,
    ],
  },
  c: {
    image: "gcc:latest",
    defaultEntry: "main.c",
    getCmd: () => [
      "sh",
      "-c",
      `gcc -O2 $(find . -name "*.c") -o prog && ./prog < input.txt`,
    ],
  },
};

/**
 * Executes user code within a hardened, isolated Docker container.
 * @param {Object} options
 * @param {string} [options.code] Single-file code string (legacy)
 * @param {Array<[string, string]>} [options.fileEntries] Multi-file array of [relativePath, content]
 * @param {string} [options.entryFile] Designated execution entry file
 * @param {string} options.input Standard input string
 * @param {string} options.language Language identifier
 */
const executeCode = async ({ code, fileEntries, entryFile, input = "", language }) => {
  const langConfig = LANGUAGE_CONFIGS[language];
  if (!langConfig) {
    throw new Error(`Execution runner configuration missing for language: ${language}`);
  }

  const rawJobId = uuidv4();
  const jobId = rawJobId.replace(/-/g, "_");

  // Create an isolated subfolder per execution
  const baseExecutionsPath = path.join(__dirname, "..", "executions");
  const jobDir = path.join(baseExecutionsPath, jobId);
  await fs.ensureDir(jobDir);

  const effectiveEntry = entryFile || langConfig.defaultEntry;

  try {
    // Write code files into the isolated job directory
    if (fileEntries && fileEntries.length > 0) {
      for (const [relPath, content] of fileEntries) {
        const fullFilePath = path.join(jobDir, relPath);
        await fs.ensureDir(path.dirname(fullFilePath));
        await fs.writeFile(fullFilePath, content, "utf8");
      }
    } else if (code) {
      const singleFilePath = path.join(jobDir, effectiveEntry);
      await fs.writeFile(singleFilePath, code, "utf8");
    }

    // Write input file
    const inputFilePath = path.join(jobDir, "input.txt");
    await fs.writeFile(inputFilePath, input || "", "utf8");

    // Build container configuration with strict security isolation
    const containerCmd = langConfig.getCmd(effectiveEntry);

    const containerOptions = {
      Image: langConfig.image,
      Tty: false,
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: "/app",
      Cmd: containerCmd,
      HostConfig: {
        // Strict directory binding restricted exclusively to this job
        Binds: [`${jobDir}:/app:rw`],

        // Zero network access - completely blocks SSRF, reverse shells, LAN probes
        NetworkMode: "none",

        // Hard memory bounds (256MB) and swap disablement to prevent host RAM starvation
        Memory: 256 * 1024 * 1024,
        MemorySwap: 256 * 1024 * 1024,

        // CPU Quota (Max 50% single CPU core) to prevent CPU starvation
        CpuPeriod: 100000,
        CpuQuota: 50000,

        // Fork-bomb defense: Caps maximum process count to 64
        PidsLimit: 64,

        // Privilege escalation defense: drop all capabilities
        CapDrop: ["ALL"],
        SecurityOpt: ["no-new-privileges"],
      },
    };

    let container;
    let timedOut = false;
    let outputLimitExceeded = false;

    return await new Promise(async (resolve, reject) => {
      try {
        container = await docker.createContainer(containerOptions);

        const stream = await container.attach({
          stream: true,
          stdout: true,
          stderr: true,
        });

        let output = "";

        stream.on("data", (chunk) => {
          if (outputLimitExceeded) return;

          const cleaned = cleanOutput(chunk);
          output += cleaned;

          // Enforce maximum output stream buffer cap
          if (output.length > MAX_OUTPUT_BYTES) {
            outputLimitExceeded = true;
            output =
              output.slice(0, MAX_OUTPUT_BYTES) +
              "\n\n[Security Alert]: Output stream exceeded maximum buffer limit (64KB). Process terminated.";
            container.kill().catch(() => {});
          }
        });

        stream.on("error", (err) => {
          console.error("Container stream fault:", err);
          reject(err);
        });

        await container.start();

        // Strict 5-second execution timeout
        const timeout = setTimeout(async () => {
          timedOut = true;
          try {
            await container.kill().catch(() => {});
          } catch {
            // Container may have already terminated
          }
          reject(new Error("Execution timed out: Maximum runtime limit (5.0s) exceeded."));
        }, 5000);

        await container.wait();
        clearTimeout(timeout);

        if (timedOut) return;

        resolve(output.trim());
      } catch (err) {
        reject(err);
      } finally {
        if (container) {
          await container.remove({ force: true }).catch(() => {});
        }
      }
    });
  } finally {
    // Guaranteed disk cleanup: remove the isolated job directory completely
    await fs.remove(jobDir).catch((err) => {
      console.error(`Failed to remove execution directory ${jobDir}:`, err);
    });
  }
};

module.exports = { executeCode };
