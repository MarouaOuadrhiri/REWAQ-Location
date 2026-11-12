const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
if (fs.existsSync(".env"))
  throw new Error(".env already exists; refusing to overwrite credentials.");
const dbPassword = crypto.randomBytes(24).toString("hex");
const rootPassword = crypto.randomBytes(24).toString("hex");
const adminPassword = crypto.randomBytes(18).toString("base64url");
const exe = path.resolve(".runtime/mysql/mysql-8.4.13-winx64/bin/mysql.exe");
const result = spawnSync(
  exe,
  ["--no-defaults", "--host=127.0.0.1", "--port=3307", "--user=root"],
  {
    input: `CREATE DATABASE IF NOT EXISTS location CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER 'location_app'@'127.0.0.1' IDENTIFIED BY '${dbPassword}'; GRANT ALL PRIVILEGES ON location.* TO 'location_app'@'127.0.0.1'; ALTER USER 'root'@'localhost' IDENTIFIED BY '${rootPassword}';`,
    encoding: "utf8",
  },
);
if (result.status !== 0)
  throw new Error(result.stderr || "MySQL configuration failed");
fs.writeFileSync(
  ".env",
  `DATABASE_URL="mysql://location_app:${dbPassword}@127.0.0.1:3307/location"\nADMIN_EMAIL="admin@location.local"\nADMIN_PASSWORD="${adminPassword}"\n`,
);
fs.writeFileSync(
  ".runtime/root-credentials.txt",
  `Local MySQL root password: ${rootPassword}\n`,
);
console.log(
  "Created location database, scoped application user and .env with generated admin credentials. Root credentials saved privately in .runtime.",
);
