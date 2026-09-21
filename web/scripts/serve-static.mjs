import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
let port = 3000;
let hostname = "127.0.0.1";
for (let index = 0; index < args.length; index += 2) {
  const [flag, value] = [args[index], args[index + 1]];
  if (value === undefined) throw new Error(`Missing value for ${flag}`);
  if (flag === "--port") port = Number(value);
  else if (flag === "--hostname") hostname = value;
  else throw new Error(`Unknown static-preview option: ${flag}`);
}
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Port must be between 1 and 65535.");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "out");
try {
  await stat(join(root, "index.html"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  throw new Error("No static build found. Run npm run build before npm run start.");
}
const realRoot = await realpath(root);
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function insideRoot(path) {
  const location = relative(realRoot, path);
  return !isAbsolute(location) && location !== ".." && !location.startsWith(`..${sep}`);
}

async function sendFile(request, response, file, statusCode = 200) {
  const actual = await realpath(file);
  if (!insideRoot(actual)) {
    response.writeHead(403).end("This file is outside the static site.");
    return;
  }
  const data = await readFile(actual);
  response.writeHead(statusCode, {
    "Content-Type": contentTypes[extname(actual)] ?? "application/octet-stream",
    "Content-Length": data.length,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  response.end(request.method === "HEAD" ? undefined : data);
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("This preview is read-only.");
    return;
  }
  let url;
  let pathname;
  try {
    url = new URL(request.url, "http://localhost");
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end("Invalid URL.");
    return;
  }
  if (/[\0\\:]/.test(pathname)) {
    response.writeHead(400).end("Invalid path.");
    return;
  }
  let file = resolve(realRoot, `.${pathname}`);
  if (!insideRoot(file)) {
    response.writeHead(403).end("This path is outside the static site.");
    return;
  }
  try {
    const info = await stat(file);
    if (info.isDirectory()) {
      if (!pathname.endsWith("/")) {
        response.writeHead(308, { Location: `${url.pathname}/${url.search}` }).end();
        return;
      }
      file = join(file, "index.html");
    }
    await sendFile(request, response, file);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      try {
        await sendFile(request, response, join(realRoot, "404.html"), 404);
      } catch (notFoundError) {
        console.error("Could not read the static 404 page:", notFoundError.code ?? notFoundError.message);
        if (!response.headersSent) response.writeHead(404).end("Page not found.");
      }
      return;
    }
    console.error("Static preview read failed:", error.code ?? error.message);
    if (!response.headersSent) response.writeHead(500).end("Unable to read the static page.");
  }
});

server.on("error", error => {
  console.error("Static preview failed to start:", error.message);
  process.exitCode = 1;
});
server.listen(port, hostname, () => {
  console.log(`Healthy Nation static preview: http://${hostname}:${port}`);
  console.log("Local preview only. The exported out directory is the deployment artifact.");
});
