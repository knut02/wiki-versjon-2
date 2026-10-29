import { spawn } from "node:child_process";
import { cp, rename, rm } from "node:fs/promises";
import path from "node:path";

const site = path.resolve(process.argv[2] ?? "dist");
const tagDir = path.join(site, "tag");
const hold = path.resolve(path.dirname(site), ".pagefind-tag-hold");
const pagefind = path.resolve("node_modules/pagefind/lib/runner/bin.cjs");

async function moveDir(from, to) {
  await rm(to, { recursive: true, force: true });
  try {
    await rename(from, to);
  } catch (error) {
    if (error?.code !== "EPERM" && error?.code !== "EXDEV") throw error;
    await cp(from, to, { recursive: true });
    await rm(from, { recursive: true, force: true });
  }
}

async function moveTagAside() {
  try {
    await moveDir(tagDir, hold);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function runPagefind() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [pagefind, "--site", site], { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pagefind avsluttet med kode ${code}`));
    });
  });
}

const moved = await moveTagAside();
try {
  await runPagefind();
} finally {
  if (moved) await moveDir(hold, tagDir);
}
