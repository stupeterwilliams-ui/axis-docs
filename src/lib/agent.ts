import { z } from "zod";
import { createAgentApp } from "@lucid-agents/hono";
import { createAgent } from "@lucid-agents/core";
import { http } from "@lucid-agents/http";
import {
  AXIS_OVERVIEW,
  CLI_COMMANDS,
  HTTP_API_ENDPOINTS,
  ENV_VARS,
  EVENT_TYPES,
  STDIN_CONTROL_MESSAGES,
  ARTIFACT_LAYOUT,
  RUNTIME_CONFIG_PATHS,
  DIAGNOSTICS,
} from "./docs-data.js";

const agent = await createAgent({
  name: process.env.AGENT_NAME ?? "axis-docs",
  version: process.env.AGENT_VERSION ?? "1.0.0",
  description:
    process.env.AGENT_DESCRIPTION ??
    "Agent-readable documentation for the Axis CLI (Eternum onchain agent). Returns structured JSON for all commands, flags, environment variables, HTTP API, and events.",
})
  .use(http())
  .build();

const { app, addEntrypoint } = await createAgentApp(agent);

// ─── Schemas ─────────────────────────────────────────────────────────────────

const cliFlagSchema = z.object({
  flag: z.string(),
  description: z.string(),
  required: z.boolean().optional(),
  example: z.string().optional(),
});

const cliCommandSchema = z.object({
  command: z.string(),
  description: z.string(),
  flags: z.array(cliFlagSchema).optional(),
  examples: z.array(z.string()).optional(),
  category: z.string(),
});

const httpEndpointSchema = z.object({
  method: z.string(),
  path: z.string(),
  description: z.string(),
  requestBody: z.record(z.string(), z.unknown()).optional(),
  example: z.string().optional(),
});

const envVarSchema = z.object({
  name: z.string(),
  default: z.string().nullable(),
  description: z.string(),
  required: z.boolean().optional(),
  category: z.enum(["core", "advanced", "auth"]),
});

const eventTypeSchema = z.object({
  type: z.string(),
  description: z.string(),
  verbosityLevel: z.enum(["quiet", "actions", "decisions", "all"]),
});

// ─── Health ───────────────────────────────────────────────────────────────────

addEntrypoint({
  key: "health",
  description: "Health check",
  input: z.object({}),
  output: z.object({ status: z.string(), version: z.string() }),
  handler: async () => ({
    output: {
      status: "ok",
      version: process.env.AGENT_VERSION ?? "1.0.0",
    },
  }),
});

// ─── Full Docs ────────────────────────────────────────────────────────────────

addEntrypoint({
  key: "docs",
  description:
    "Return the complete structured Axis CLI documentation as a single JSON object. Includes overview, all commands, flags, HTTP API, environment variables, events, stdin messages, and diagnostics.",
  input: z.object({}),
  output: z.object({
    overview: z.object({
      name: z.string(),
      description: z.string(),
      sourceUrl: z.string(),
      version: z.string(),
      capabilities: z.array(z.string()),
      installation: z.object({
        quickInstall: z.string(),
        verify: z.string(),
        pinVersion: z.string(),
      }),
      modes: z.record(z.string(), z.record(z.string(), z.string())),
    }),
    commands: z.array(cliCommandSchema),
    httpApi: z.array(httpEndpointSchema),
    envVars: z.array(envVarSchema),
    events: z.array(eventTypeSchema),
    stdinMessages: z.array(
      z.object({
        type: z.string(),
        description: z.string(),
        schema: z.record(z.string(), z.unknown()),
        example: z.string(),
      })
    ),
    artifactLayout: z.record(z.string(), z.unknown()),
    runtimeConfigPaths: z.array(
      z.object({
        path: z.string(),
        description: z.string(),
        example: z.unknown(),
      })
    ),
    diagnostics: z.object({
      command: z.string(),
      commonIssues: z.array(
        z.object({
          issue: z.string(),
          resolution: z.string(),
        })
      ),
    }),
  }),
  handler: async () => ({
    output: {
      overview: AXIS_OVERVIEW,
      commands: CLI_COMMANDS,
      httpApi: HTTP_API_ENDPOINTS,
      envVars: ENV_VARS,
      events: EVENT_TYPES,
      stdinMessages: STDIN_CONTROL_MESSAGES,
      artifactLayout: ARTIFACT_LAYOUT,
      runtimeConfigPaths: RUNTIME_CONFIG_PATHS,
      diagnostics: DIAGNOSTICS,
    },
  }),
});

// ─── Commands ─────────────────────────────────────────────────────────────────

addEntrypoint({
  key: "docs-commands",
  description:
    "Return all Axis CLI commands with their descriptions, flags, and usage examples. Useful for an agent building shell commands.",
  input: z.object({
    category: z
      .enum(["run", "auth", "discovery", "ops", "info"])
      .optional()
      .describe("Filter commands by category"),
  }),
  output: z.object({
    commands: z.array(cliCommandSchema),
    categories: z.array(z.string()),
  }),
  handler: async (ctx) => {
    const { category } = ctx.input as { category?: string };
    const filtered = category
      ? CLI_COMMANDS.filter((c) => c.category === category)
      : CLI_COMMANDS;
    const categories = [...new Set(CLI_COMMANDS.map((c) => c.category))];
    return { output: { commands: filtered, categories } };
  },
});

// ─── HTTP API ─────────────────────────────────────────────────────────────────

addEntrypoint({
  key: "docs-http-api",
  description:
    "Return the Axis headless HTTP API endpoints. These endpoints are available when Axis is running with --api-port. Use this to control a running Axis agent from another process or orchestrator.",
  input: z.object({}),
  output: z.object({
    note: z.string(),
    startCommand: z.string(),
    endpoints: z.array(httpEndpointSchema),
    stdinMessages: z.array(z.object({
      type: z.string(),
      description: z.string(),
      schema: z.record(z.string(), z.unknown()),
      example: z.string(),
    })),
  }),
  handler: async () => ({
    output: {
      note:
        "Enable the HTTP API by passing --api-port=<port> when starting Axis in headless mode. Default bind host is 127.0.0.1.",
      startCommand: "axis run --headless --world=my-world --api-port=3000 --stdin",
      endpoints: HTTP_API_ENDPOINTS,
      stdinMessages: STDIN_CONTROL_MESSAGES,
    },
  }),
});

// ─── Env Vars ─────────────────────────────────────────────────────────────────

addEntrypoint({
  key: "docs-env",
  description:
    "Return all Axis environment variables and configuration settings. Useful for generating .env files or validating an agent environment setup.",
  input: z.object({
    category: z
      .enum(["core", "advanced", "auth"])
      .optional()
      .describe("Filter env vars by category"),
  }),
  output: z.object({
    configFilePrecedence: z.array(z.string()),
    envVars: z.array(envVarSchema),
    runtimeConfigPaths: z.array(z.object({
      path: z.string(),
      description: z.string(),
      example: z.unknown(),
    })),
    artifactLayout: z.record(z.string(), z.unknown()),
  }),
  handler: async (ctx) => {
    const { category } = ctx.input as { category?: string };
    const filtered = category
      ? ENV_VARS.filter((e) => e.category === category)
      : ENV_VARS;
    return {
      output: {
        configFilePrecedence: [
          "~/.eternum-agent/.env (global config — lowest priority)",
          "./.env (current directory — local overrides)",
          "Shell environment (export KEY=value — highest priority, always wins)",
        ],
        envVars: filtered,
        runtimeConfigPaths: RUNTIME_CONFIG_PATHS,
        artifactLayout: ARTIFACT_LAYOUT,
      },
    };
  },
});

// ─── Events ───────────────────────────────────────────────────────────────────

addEntrypoint({
  key: "docs-events",
  description:
    "Return the NDJSON event types emitted by Axis in headless mode. Use this to understand the event stream and set the correct --verbosity level.",
  input: z.object({
    verbosityLevel: z
      .enum(["quiet", "actions", "decisions", "all"])
      .optional()
      .describe("Filter events by minimum verbosity level"),
  }),
  output: z.object({
    format: z.string(),
    verbosityLevels: z.object({
      quiet: z.array(z.string()),
      actions: z.array(z.string()),
      decisions: z.array(z.string()),
      all: z.array(z.string()),
    }),
    events: z.array(eventTypeSchema),
  }),
  handler: async (ctx) => {
    const { verbosityLevel } = ctx.input as { verbosityLevel?: string };

    const levels = ["quiet", "actions", "decisions", "all"];
    const minIdx = verbosityLevel ? levels.indexOf(verbosityLevel) : 0;
    const filtered = EVENT_TYPES.filter(
      (e) => levels.indexOf(e.verbosityLevel) <= (minIdx === 0 ? Infinity : minIdx)
    );

    return {
      output: {
        format: "Newline-delimited JSON (NDJSON) to stdout",
        verbosityLevels: {
          quiet: ["error", "session", "shutdown"],
          actions: ["error", "session", "shutdown", "action"],
          decisions: [
            "error", "session", "shutdown", "action",
            "decision", "heartbeat", "prompt", "startup", "config",
          ],
          all: [
            "error", "session", "shutdown", "action",
            "decision", "heartbeat", "prompt", "startup", "config", "tick",
          ],
        },
        events: verbosityLevel ? filtered : EVENT_TYPES,
      },
    };
  },
});

// ─── Search ───────────────────────────────────────────────────────────────────

addEntrypoint({
  key: "docs-search",
  description:
    "Keyword search over all Axis CLI documentation. Returns matching commands, flags, env vars, events, and HTTP endpoints. Useful for an agent that needs to find specific functionality.",
  input: z.object({
    query: z.string().min(1).describe("Search keyword or phrase"),
  }),
  output: z.object({
    query: z.string(),
    results: z.object({
      commands: z.array(cliCommandSchema),
      httpEndpoints: z.array(httpEndpointSchema),
      envVars: z.array(envVarSchema),
      events: z.array(eventTypeSchema),
    }),
    totalResults: z.number(),
  }),
  handler: async (ctx) => {
    const { query } = ctx.input as { query: string };
    const q = query.toLowerCase();

    const matchCmd = (cmd: typeof CLI_COMMANDS[number]) =>
      cmd.command.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      (cmd.flags?.some(
        (f) =>
          f.flag.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      ) ?? false) ||
      (cmd.examples?.some((e) => e.toLowerCase().includes(q)) ?? false);

    const matchEndpoint = (ep: typeof HTTP_API_ENDPOINTS[number]) =>
      ep.path.toLowerCase().includes(q) ||
      ep.description.toLowerCase().includes(q) ||
      ep.method.toLowerCase().includes(q);

    const matchEnv = (ev: typeof ENV_VARS[number]) =>
      ev.name.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q);

    const matchEvent = (ev: typeof EVENT_TYPES[number]) =>
      ev.type.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.verbosityLevel.toLowerCase().includes(q);

    const commands = CLI_COMMANDS.filter(matchCmd);
    const httpEndpoints = HTTP_API_ENDPOINTS.filter(matchEndpoint);
    const envVars = ENV_VARS.filter(matchEnv);
    const events = EVENT_TYPES.filter(matchEvent);

    return {
      output: {
        query,
        results: { commands, httpEndpoints, envVars, events },
        totalResults:
          commands.length + httpEndpoints.length + envVars.length + events.length,
      },
    };
  },
});

export { app };
