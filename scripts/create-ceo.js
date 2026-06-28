const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=['"]?(.*?)['"]?$/);
    if (match) process.env[match[1]] = match[2];
  }
}

async function main() {
  const [, , username = "ceo", password = "ChangeMe123!", name = "CEO"] = process.argv;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const passwordHash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO users (name, username, password_hash, role)
     VALUES ($1, $2, $3, 'CEO')
     ON CONFLICT (username)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, is_active = TRUE`,
    [name, username, passwordHash]
  );

  await pool.end();
  console.log(`CEO login ready. Username: ${username}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
