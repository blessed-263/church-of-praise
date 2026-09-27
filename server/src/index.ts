import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import pg from "pg";

const { Pool } = pg;

const PORT = Number(process.env.PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL;
const API_SECRET = process.env.API_SECRET || "";

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY DEFAULT 'current',
      raw_text TEXT NOT NULL,
      theme JSONB NOT NULL,
      offering_config JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

type ServiceBody = {
  rawText?: unknown;
  theme?: unknown;
  offeringConfig?: unknown;
};

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "PUT", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-API-Secret"],
  })
);

app.get("/api/health", (c) => c.json({ ok: true }));

app.use("/api/service", async (c, next) => {
  if (!API_SECRET) {
    return c.json({ error: "Server API_SECRET is not configured" }, 500);
  }
  const provided = c.req.header("X-API-Secret") || "";
  if (provided !== API_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

app.get("/api/service", async (c) => {
  const result = await pool.query(
    `SELECT id, raw_text, theme, offering_config, updated_at
     FROM services WHERE id = 'current'`
  );

  if (result.rowCount === 0) {
    return c.json({ service: null });
  }

  const row = result.rows[0];
  return c.json({
    service: {
      rawText: row.raw_text,
      theme: row.theme,
      offeringConfig: row.offering_config,
      updatedAt: row.updated_at,
    },
  });
});

app.put("/api/service", async (c) => {
  const body = (await c.req.json().catch(() => null)) as ServiceBody | null;
  if (!body || typeof body.rawText !== "string" || !body.theme || !body.offeringConfig) {
    return c.json({ error: "Invalid body" }, 400);
  }

  const result = await pool.query(
    `INSERT INTO services (id, raw_text, theme, offering_config, updated_at)
     VALUES ('current', $1, $2::jsonb, $3::jsonb, now())
     ON CONFLICT (id) DO UPDATE SET
       raw_text = EXCLUDED.raw_text,
       theme = EXCLUDED.theme,
       offering_config = EXCLUDED.offering_config,
       updated_at = now()
     RETURNING updated_at`,
    [body.rawText, JSON.stringify(body.theme), JSON.stringify(body.offeringConfig)]
  );

  return c.json({ ok: true, updatedAt: result.rows[0].updated_at });
});

await ensureSchema();

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`API listening on ${info.port}`);
});
