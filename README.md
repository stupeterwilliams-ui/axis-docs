# Axis CLI Agent-Readable API Documentation

A Lucid Agents-compatible HTTP service that exposes structured, machine-readable documentation for the [Axis CLI](https://docs.realms.world/development/axis/overview) — the Eternum onchain agent CLI.

## What It Does

Axis is the Eternum onchain agent CLI. It discovers active worlds, authenticates with Cartridge Controller, and runs an LLM-driven tick loop that observes game state and executes on-chain actions.

This service translates the Axis CLI documentation into a format optimised for agent consumption:

- **`/docs`** — Full structured API reference as JSON (commands, flags, environment variables, HTTP API, events)
- **`/docs/commands`** — All CLI commands with descriptions and flags
- **`/docs/http-api`** — Axis HTTP API endpoints (when running headless)
- **`/docs/env`** — Environment variables and configuration
- **`/docs/events`** — NDJSON event types emitted in headless mode
- **`/docs/search`** — Keyword search over the documentation
- **`/health`** — Health check

All responses follow the `@lucid-agents/core` agent pattern with typed Zod schemas.

## How It Works

The documentation is compiled from the official Axis docs pages and stored as structured data at build time. Each endpoint returns a consistent JSON schema that agents can parse programmatically without reading human-formatted HTML.

## Quick Start

```bash
bun install
bun run dev   # http://localhost:3000
```

## Deploy

```bash
railway up
```

## Example

```bash
# Get all CLI commands
curl http://localhost:3000/docs/commands

# Search for auth-related docs
curl -X POST http://localhost:3000/docs/search \
  -H 'Content-Type: application/json' \
  -d '{"query": "headless auth"}'
```
