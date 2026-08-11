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
  const [, , username, password, name, jobTitle] = process.argv;
  if (!username || !password || !name || !jobTitle) {
    throw new Error("Usage: node scripts/create-viewer.js <username> <password> <name> <job-title>");
  }
  if (password.length < 12) throw new Error("Password must contain at least 12 characters.");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (name, username, password_hash, role, job_title, office_id)
     VALUES ($1, $2, $3, 'VIEWER', $4, NULL)
     ON CONFLICT (username) DO UPDATE SET
       password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = 'VIEWER',
       job_title = EXCLUDED.job_title, office_id = NULL, is_active = TRUE, updated_at = NOW()`,
    [name, username, passwordHash, jobTitle]
  );
  await pool.end();
  console.log(`Restricted viewer login ready: ${username} (${jobTitle})`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
