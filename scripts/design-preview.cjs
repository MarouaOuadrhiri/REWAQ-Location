const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = process.cwd();
http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1:3002");
    const relative =
      url.pathname === "/"
        ? "docs/design-directions.html"
        : decodeURIComponent(url.pathname).replace(/^\//, "");
    const file = path.resolve(root, relative);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    const allowedRoots = [path.join(root, "public", "brand") + path.sep, path.join(root, "public", "vehicles") + path.sep];
    if (file !== path.join(root, "docs", "design-directions.html") && !allowedRoots.some(prefix => file.startsWith(prefix))) {
      res.writeHead(404);
      return res.end();
    }
    try {
      const data = await fs.readFile(file);
      const ext = path.extname(file);
      res.writeHead(200, {
        "Content-Type":
          ext === ".html"
            ? "text/html; charset=utf-8"
            : ext === ".svg"
              ? "image/svg+xml"
              : ext === ".png"
                ? "image/png"
                : "text/plain",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end();
    }
  })
  .listen(3002, "127.0.0.1", () =>
    console.log("Design proposals: http://127.0.0.1:3002"),
  );
