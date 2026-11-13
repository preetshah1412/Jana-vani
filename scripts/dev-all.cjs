const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const node = process.execPath;
const services = [
  {
    name: "frontend",
    cwd: root,
    args: [path.join(root, "node_modules", "vite", "bin", "vite.js")],
  },
  {
    name: "backend",
    cwd: path.join(root, "backend"),
    args: ["server.js"],
  },
];

const children = services.map(({ name, cwd, args }) => {
  const child = spawn(node, args, { cwd, stdio: "inherit" });
  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} stopped with exit code ${code}`);
      stopAll(code);
    }
  });
  return child;
});

let stopping = false;
function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = code;
}

process.on("SIGINT", () => stopAll());
process.on("SIGTERM", () => stopAll());
