# Axis CLI Agent-Readable API Documentation — Taskmarket Submission

## Task
CERTIFICATION: Agent-Readable API Documentation
- Source: https://docs.realms.world/development/axis/overview
- Task ID: 0x4485b14e9649fdf7270fd630d5364a0e12f8e29bda6ad05cd0f865037ad31dee

## What Was Built

A deployed `@lucid-agents/core` HTTP agent that exposes the complete Axis CLI API documentation as structured, machine-readable JSON endpoints. Instead of HTML docs that require parsing, agents can call typed endpoints to get exactly the data they need.

## Live URLs

- **Base URL:** https://axis-docs-production.up.railway.app
- **Health:** https://axis-docs-production.up.railway.app/health
- **Agent Manifest:** https://axis-docs-production.up.railway.app/.well-known/agent.json
- **UI:** https://axis-docs-production.up.railway.app/

## GitHub Repo

https://github.com/stupeterwilliams-ui/axis-docs

## Endpoints

All endpoints follow the `@lucid-agents/core` pattern — POST to `/entrypoints/<key>/invoke` with `{"input": {...}}`.

| Key | Path | Description |
|-----|------|-------------|
| `health` | `GET /health` | Health check |
| `docs` | `POST /entrypoints/docs/invoke` | Full documentation as one JSON object |
| `docs-commands` | `POST /entrypoints/docs-commands/invoke` | All CLI commands, flags, examples (filterable by category) |
| `docs-http-api` | `POST /entrypoints/docs-http-api/invoke` | Axis headless HTTP API endpoints |
| `docs-env` | `POST /entrypoints/docs-env/invoke` | Environment variables (filterable by category) |
| `docs-events` | `POST /entrypoints/docs-events/invoke` | NDJSON event types and verbosity levels |
| `docs-search` | `POST /entrypoints/docs-search/invoke` | Keyword search across all docs |

## Technical Approach

1. **Data extraction:** Fetched all 5 Axis docs pages, structured everything into typed TypeScript objects in `src/lib/docs-data.ts`
2. **Coverage:** 8 CLI commands, 23 env vars, 8 HTTP API endpoints, 10 event types, 3 stdin control messages, artifact layout, runtime config paths, diagnostics
3. **Agent pattern:** Uses `@lucid-agents/hono` + `@lucid-agents/core` with Zod v4 schemas — each entrypoint has fully typed input/output
4. **Search:** Full-text search across commands (including flags), HTTP endpoints, env vars, and events
5. **Filtering:** Category-based filters on commands (`run|auth|discovery|ops|info`) and env vars (`core|advanced|auth`)
6. **Deploy:** Railway via Dockerfile + bun runtime

## Test Results

```bash
# Live health check
curl https://axis-docs-production.up.railway.app/health
# → {"ok":true,"version":"1.0.0"}

# Full docs
curl -X POST https://axis-docs-production.up.railway.app/entrypoints/docs/invoke \
  -H 'Content-Type: application/json' -d '{"input":{}}'
# → overview.name: "Axis", commands: 8, envVars: 23, httpApi: 8, events: 10

# Search
curl -X POST https://axis-docs-production.up.railway.app/entrypoints/docs-search/invoke \
  -H 'Content-Type: application/json' -d '{"input":{"query":"auth"}}'
# → totalResults: 9 (commands: axis run, axis auth, axis doctor + env vars + ...)

# Get run commands only
curl -X POST https://axis-docs-production.up.railway.app/entrypoints/docs-commands/invoke \
  -H 'Content-Type: application/json' -d '{"input":{"category":"run"}}'
# → commands: ["axis", "axis run"]

# HTTP API docs
curl -X POST https://axis-docs-production.up.railway.app/entrypoints/docs-http-api/invoke \
  -H 'Content-Type: application/json' -d '{"input":{}}'
# → 8 endpoints: POST /prompt, GET /status, GET /state, GET /events, POST /config, POST /shutdown, GET+POST /auth/callback
```

## Architecture

```
src/
├── index.ts              # Bun HTTP server entrypoint
└── lib/
    ├── docs-data.ts       # Structured Axis docs data (typed TypeScript)
    └── agent.ts           # Lucid agent with 7 entrypoints (Zod schemas)
```

## Assumptions Made

- "Agent-readable documentation following the patterns" — interpreted as using the `@lucid-agents/core` agent pattern with typed Zod schemas, returning structured JSON rather than HTML
- All documentation scraped from the 5 official Axis docs pages as of 2026-03-05
- No payments required (all endpoints free) as this is documentation, not a compute-heavy service
