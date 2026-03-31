import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";

const port = Number(process.env.PORT || 8080);
const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3001";
const distDir = resolve("dist");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2"
};

const server = createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    if (req.url === "/config.json") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ apiBaseUrl }));
      return;
    }

    let requestPath = req.url.split("?")[0];
    if (requestPath === "/") {
      requestPath = "/index.html";
    }

    const filePath = join(distDir, requestPath);
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isFile()) {
        const extension = extname(filePath);
        res.writeHead(200, {
          "Content-Type": contentTypes[extension] || "application/octet-stream"
        });
        createReadStream(filePath).pipe(res);
        return;
      }
    } catch {
      // Fall back to SPA entry.
    }

    const html = await readFile(join(distDir, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(error instanceof Error ? error.message : "Unknown server error");
  }
});

server.listen(port, () => {
  console.log(`Frontend server listening on port ${port}`);
});
