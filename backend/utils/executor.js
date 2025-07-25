require("dotenv").config();
const Docker = require("dockerode");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const docker = new Docker({
  host: process.env.DOCKER_HOST || "127.0.0.1",
  port: process.env.DOCKER_PORT ? parseInt(process.env.DOCKER_PORT) : 2375,
});

// ✅ FIXED: Preserve \n and \t in output
const cleanOutput = (data) => {
  return data
    .toString("utf8")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "") // keep tabs, newlines, and carriage returns
    .trim();
};

const executeCode = async (code, input, language) => {
  const rawJobId = uuidv4();
  const jobId = rawJobId.replace(/-/g, "_"); // Java-safe name

  const basePath = path.join(__dirname, "..", "executions");
  await fs.ensureDir(basePath);

  const ext = language === "python" ? "py" : "java";
  const codeFile =
    language === "python"
      ? path.join(basePath, `${jobId}.py`)
      : path.join(basePath, `Main_${jobId}.java`);
  const inputFile = path.join(basePath, `${jobId}.txt`);
  const classFile = path.join(basePath, `Main_${jobId}.class`);

  // Modify Java class name
  let modifiedCode = code;
  if (language === "java") {
    modifiedCode = code.replace(
      /public\s+class\s+Main/,
      `public class Main_${jobId}`
    );
  }

  // Write code and input to files
  await fs.writeFile(codeFile, modifiedCode);
  await fs.writeFile(inputFile, input);

  // Define command to run inside Docker
  const containerCmd =
    language === "python"
      ? ["sh", "-c", `python ${jobId}.py < ${jobId}.txt`]
      : [
          "sh",
          "-c",
          `javac Main_${jobId}.java && java Main_${jobId} < ${jobId}.txt`,
        ];

  const containerOptions = {
    Image: language === "python" ? "python:3.8-slim" : "openjdk:11",
    Tty: false,
    AttachStdout: true,
    AttachStderr: true,
    HostConfig: {
      Binds: [`${basePath}:/app`],
      Memory: 512 * 1024 * 1024, // 512MB
      CpuPeriod: 100000,
      CpuQuota: 50000, // 50% CPU
    },
    WorkingDir: "/app",
    Cmd: containerCmd,
  };

  return new Promise(async (resolve, reject) => {
    let container;
    try {
      container = await docker.createContainer(containerOptions);

      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true,
      });

      let output = "";

      stream.on("data", (chunk) => {
        // Optional debug: console.log("Raw Output:", JSON.stringify(chunk.toString()));
        output += cleanOutput(chunk);
      });

      stream.on("error", (err) => {
        console.error("Docker stream error:", err);
        reject(err);
      });

      await container.start();

      const timeout = setTimeout(async () => {
        await container.kill().catch(() => {});
        await container.remove().catch(() => {});
        reject(new Error("⏱️ Execution timed out after 5 seconds"));
      }, 5000);

      await container.wait();
      clearTimeout(timeout);
      await container.remove().catch(() => {});

      // Cleanup
      await fs.remove(codeFile).catch(() => {});
      await fs.remove(inputFile).catch(() => {});
      if (language === "java") {
        await fs.remove(classFile).catch(() => {});
      }

      resolve(output.trim());
    } catch (err) {
      if (container) {
        await container.remove().catch(() => {});
      }
      await fs.remove(codeFile).catch(() => {});
      await fs.remove(inputFile).catch(() => {});
      if (language === "java") {
        await fs.remove(classFile).catch(() => {});
      }

      reject(err);
    }
  });
};

module.exports = { executeCode };
