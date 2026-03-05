/**
 * Axis CLI structured documentation data.
 * Compiled from https://docs.realms.world/development/axis/overview
 */

export interface CliFlag {
  flag: string;
  description: string;
  required?: boolean;
  example?: string;
}

export interface CliCommand {
  command: string;
  description: string;
  flags?: CliFlag[];
  examples?: string[];
  category: string;
}

export interface HttpEndpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: Record<string, unknown>;
  example?: string;
}

export interface EnvVar {
  name: string;
  default: string | null;
  description: string;
  required?: boolean;
  category: "core" | "advanced" | "auth";
}

export interface EventType {
  type: string;
  description: string;
  verbosityLevel: "quiet" | "actions" | "decisions" | "all";
}

export const AXIS_OVERVIEW = {
  name: "Axis",
  description:
    "Axis is the Eternum onchain agent CLI. It discovers active worlds, authenticates with Cartridge Controller, and runs an LLM-driven tick loop that observes game state and executes on-chain actions.",
  sourceUrl: "https://docs.realms.world/development/axis/overview",
  version: "latest",
  capabilities: [
    "Discovers live worlds across slot, sepolia, and mainnet",
    "Authenticates via password (headless) or browser (interactive)",
    "Runs in TUI mode or headless server mode",
    "Generates game actions from contract ABIs at runtime",
    "Persists agent memory and strategy per world",
    "Exposes HTTP + stdin control in headless mode",
  ],
  installation: {
    quickInstall:
      "curl -fsSL https://github.com/bibliothecadao/eternum/releases/latest/download/install-axis.sh | bash",
    verify: "axis --version",
    pinVersion: "VERSION=v0.1.0 bash",
  },
  modes: {
    tui: {
      command: "axis",
      useCase: "Running manually on a laptop",
      worldSelection: "Interactive picker",
      auth: "Opens browser automatically",
      output: "Terminal UI with chat log",
      control: "Keyboard input",
    },
    headless: {
      command: "axis run --headless",
      useCase: "VPS, CI, fleet orchestration",
      worldSelection: "--world=<name> (required)",
      auth: "--method=password or QR + redirect",
      output: "NDJSON to stdout",
      control: "HTTP API, stdin, SSE",
    },
  },
};

export const CLI_COMMANDS: CliCommand[] = [
  {
    command: "axis",
    description: "Run Axis in TUI mode (interactive terminal UI)",
    category: "run",
    examples: ["axis"],
  },
  {
    command: "axis run",
    description: "Run Axis (alias for axis, supports additional flags)",
    flags: [
      {
        flag: "--headless",
        description: "Run without TUI; emit NDJSON to stdout",
        required: false,
      },
      {
        flag: "--world=<name>",
        description: "Target world (required for headless mode)",
        required: false,
        example: "--world=my-world",
      },
      {
        flag: "--auth=session|privatekey",
        description: "Auth strategy to use",
        required: false,
        example: "--auth=privatekey",
      },
      {
        flag: "--api-port=<port>",
        description: "Enable HTTP API on the specified port",
        required: false,
        example: "--api-port=3000",
      },
      {
        flag: "--api-host=<host>",
        description: "API bind host",
        required: false,
        example: "--api-host=0.0.0.0",
      },
      {
        flag: "--stdin",
        description: "Enable stdin command stream (one JSON object per line)",
        required: false,
      },
      {
        flag: "--verbosity=quiet|actions|decisions|all",
        description: "Output verbosity filter for headless mode",
        required: false,
        example: "--verbosity=decisions",
      },
    ],
    examples: [
      "axis run --headless --world=my-world --api-port=3000",
      "axis run --headless --world=my-world --stdin",
      "axis run --headless --world=my-world --verbosity=all",
    ],
    category: "run",
  },
  {
    command: "axis worlds",
    description: "List all discovered active worlds across slot, sepolia, and mainnet",
    category: "discovery",
    examples: ["axis worlds", "SLOT_NAME=my-world axis run"],
  },
  {
    command: "axis auth <world>",
    description:
      "Authenticate with a world. Generates a session URL for browser approval (non-blocking if no TTY).",
    flags: [
      {
        flag: "--method=password",
        description: "Use password auth (no browser required)",
        required: false,
      },
      {
        flag: "--username=<user>",
        description: "Username for password auth",
        required: false,
        example: "--username=me",
      },
      {
        flag: "--password=<pass>",
        description: "Password for password auth",
        required: false,
        example: "--password=secret",
      },
      {
        flag: "--redirect-url=<url>",
        description: "Complete auth with the redirect URL from browser approval",
        required: false,
        example: '--redirect-url="http://localhost:3000/callback?startapp=..."',
      },
      {
        flag: "--session-data=<base64>",
        description: "Complete auth with raw base64 session data",
        required: false,
        example: "--session-data=<base64>",
      },
      {
        flag: "--callback-url=<url>",
        description: "Public callback endpoint on your VPS",
        required: false,
        example: "--callback-url=http://my-host:3000",
      },
      {
        flag: "--status",
        description: "Check session status instead of generating auth URL",
        required: false,
      },
      {
        flag: "--all",
        description: "Target all discovered worlds",
        required: false,
      },
      {
        flag: "--json",
        description: "JSON output for command responses",
        required: false,
      },
      {
        flag: "--timeout=<ms>",
        description: "Approval wait timeout in milliseconds",
        required: false,
        example: "--timeout=30000",
      },
    ],
    examples: [
      "axis auth my-world",
      "axis auth my-world --method=password --username=me --password=secret",
      'axis auth my-world --redirect-url="http://localhost:PORT/callback?startapp=..."',
      "axis auth my-world --status",
      "axis auth --all --method=password --username=me --password=secret --json",
      "axis auth --all --status --json",
    ],
    category: "auth",
  },
  {
    command: "axis doctor",
    description:
      "Validate configuration and diagnose common issues (network, auth, worlds)",
    category: "ops",
    examples: ["axis doctor"],
  },
  {
    command: "axis init [world]",
    description:
      "Manually seed runtime directories and config. Optional — all directories are auto-created when needed.",
    category: "ops",
    examples: ["axis init", "axis init my-world"],
  },
  {
    command: "axis --version",
    description: "Print the installed Axis version",
    category: "info",
    examples: ["axis --version"],
  },
  {
    command: "axis --help",
    description: "Print usage information",
    category: "info",
    examples: ["axis --help"],
  },
];

export const HTTP_API_ENDPOINTS: HttpEndpoint[] = [
  {
    method: "POST",
    path: "/prompt",
    description: "Queue a prompt for the agent to process",
    requestBody: {
      content: "string — the prompt text to send to the agent",
    },
    example:
      'curl -X POST http://127.0.0.1:3000/prompt -H \'Content-Type: application/json\' -d \'{"content":"Build a farm at your main realm"}\'',
  },
  {
    method: "GET",
    path: "/status",
    description: "Get current agent status",
    example: "curl http://127.0.0.1:3000/status",
  },
  {
    method: "GET",
    path: "/state",
    description: "Get a snapshot of the current world state",
    example: "curl http://127.0.0.1:3000/state",
  },
  {
    method: "GET",
    path: "/events",
    description: "Server-Sent Events (SSE) stream of agent events",
    example: "curl http://127.0.0.1:3000/events",
  },
  {
    method: "POST",
    path: "/config",
    description: "Apply runtime configuration updates (live, no restart needed)",
    requestBody: {
      changes: "array of {path: string, value: any} — config path and new value",
    },
    example:
      'curl -X POST http://127.0.0.1:3000/config -H \'Content-Type: application/json\' -d \'{"changes":[{"path":"tickIntervalMs","value":30000}]}\'',
  },
  {
    method: "POST",
    path: "/shutdown",
    description: "Gracefully shut down the agent",
    example: "curl -X POST http://127.0.0.1:3000/shutdown",
  },
  {
    method: "GET",
    path: "/auth/callback",
    description: "Cartridge Controller auth callback endpoint",
    example: "GET /auth/callback?startapp=...",
  },
  {
    method: "POST",
    path: "/auth/callback",
    description: "Cartridge Controller auth callback endpoint (POST form)",
    example: "POST /auth/callback",
  },
];

export const ENV_VARS: EnvVar[] = [
  {
    name: "MODEL_PROVIDER",
    default: "anthropic",
    description: "LLM provider. Options: anthropic, openai, openrouter, google",
    required: false,
    category: "core",
  },
  {
    name: "MODEL_ID",
    default: "claude-sonnet-4-5-20250929",
    description: "Model identifier for the chosen provider",
    required: false,
    category: "core",
  },
  {
    name: "ANTHROPIC_API_KEY",
    default: null,
    description: "Required when MODEL_PROVIDER=anthropic",
    required: false,
    category: "core",
  },
  {
    name: "OPENAI_API_KEY",
    default: null,
    description: "Required when MODEL_PROVIDER=openai",
    required: false,
    category: "core",
  },
  {
    name: "CHAIN",
    default: "slot",
    description: "Chain selection: slot, sepolia, or mainnet",
    required: false,
    category: "core",
  },
  {
    name: "SLOT_NAME",
    default: null,
    description: "Auto-select a discovered world by slot name (skips picker)",
    required: false,
    category: "core",
  },
  {
    name: "GAME_NAME",
    default: "eternum",
    description: "Session/game namespace",
    required: false,
    category: "core",
  },
  {
    name: "TICK_INTERVAL_MS",
    default: "60000",
    description: "Agent tick interval in milliseconds",
    required: false,
    category: "core",
  },
  {
    name: "LOOP_ENABLED",
    default: "true",
    description: "Auto-start the tick loop on launch",
    required: false,
    category: "core",
  },
  {
    name: "ETERNUM_AGENT_HOME",
    default: "~/.eternum-agent",
    description: "Runtime root directory",
    required: false,
    category: "core",
  },
  {
    name: "DATA_DIR",
    default: "$ETERNUM_AGENT_HOME/data",
    description: "Agent data root directory",
    required: false,
    category: "core",
  },
  {
    name: "SESSION_BASE_PATH",
    default: "$ETERNUM_AGENT_HOME/.cartridge",
    description: "Session/artifact root directory",
    required: false,
    category: "core",
  },
  {
    name: "RPC_URL",
    default: null,
    description: "Manual RPC URL override (skips world discovery)",
    required: false,
    category: "advanced",
  },
  {
    name: "TORII_URL",
    default: null,
    description: "Manual Torii indexer URL override",
    required: false,
    category: "advanced",
  },
  {
    name: "WORLD_ADDRESS",
    default: null,
    description: "Manual world contract address override",
    required: false,
    category: "advanced",
  },
  {
    name: "MANIFEST_PATH",
    default: null,
    description: "Explicit manifest file path override",
    required: false,
    category: "advanced",
  },
  {
    name: "CHAIN_ID",
    default: null,
    description: "Override inferred chain ID",
    required: false,
    category: "advanced",
  },
  {
    name: "CARTRIDGE_API_BASE",
    default: null,
    description: "Factory/discovery API base URL override",
    required: false,
    category: "advanced",
  },
  {
    name: "AXIS_AUTH_REDIRECT_URL",
    default: "https://auth.axis.gg",
    description:
      "Redirect page that decompresses auth payload and redirects to Cartridge auth URL",
    required: false,
    category: "auth",
  },
  {
    name: "PRIVATE_KEY",
    default: null,
    description: "Private key for privatekey auth mode (bypasses Cartridge Controller)",
    required: false,
    category: "auth",
  },
  {
    name: "ACCOUNT_ADDRESS",
    default: null,
    description:
      "Account address for privatekey auth mode. Gas is paid directly (no paymaster).",
    required: false,
    category: "auth",
  },
  {
    name: "MASTER_ADDRESS",
    default: null,
    description: "Optional auto top-up address for non-mainnet fee token shortfalls",
    required: false,
    category: "auth",
  },
  {
    name: "MASTER_PRIVATE_KEY",
    default: null,
    description: "Optional auto top-up private key for non-mainnet fee token shortfalls",
    required: false,
    category: "auth",
  },
];

export const EVENT_TYPES: EventType[] = [
  {
    type: "startup",
    description:
      "Emitted once on agent startup with initial configuration and world info",
    verbosityLevel: "decisions",
  },
  {
    type: "session",
    description: "Emitted when a new Cartridge Controller session is established",
    verbosityLevel: "quiet",
  },
  {
    type: "decision",
    description:
      "Emitted when the LLM makes a strategic decision about what actions to take",
    verbosityLevel: "decisions",
  },
  {
    type: "action",
    description: "Emitted when an on-chain action is executed",
    verbosityLevel: "actions",
  },
  {
    type: "prompt",
    description: "Emitted when a prompt is sent to the LLM",
    verbosityLevel: "decisions",
  },
  {
    type: "heartbeat",
    description: "Periodic liveness signal emitted each tick",
    verbosityLevel: "decisions",
  },
  {
    type: "config",
    description: "Emitted when runtime configuration is updated",
    verbosityLevel: "decisions",
  },
  {
    type: "error",
    description: "Emitted on errors (auth failures, contract errors, etc.)",
    verbosityLevel: "quiet",
  },
  {
    type: "shutdown",
    description: "Emitted before agent graceful shutdown",
    verbosityLevel: "quiet",
  },
  {
    type: "tick",
    description: "Emitted on every tick of the agent loop (verbose)",
    verbosityLevel: "all",
  },
];

export const STDIN_CONTROL_MESSAGES = [
  {
    type: "prompt",
    description: "Send a prompt to the agent",
    schema: { type: "prompt", content: "string" },
    example: '{"type":"prompt","content":"Scout north"}',
  },
  {
    type: "config",
    description: "Update runtime configuration",
    schema: { type: "config", changes: "Array<{path: string, value: any}>" },
    example: '{"type":"config","changes":[{"path":"tickIntervalMs","value":45000}]}',
  },
  {
    type: "shutdown",
    description: "Gracefully shut down the agent",
    schema: { type: "shutdown" },
    example: '{"type":"shutdown"}',
  },
];

export const ARTIFACT_LAYOUT = {
  root: "~/.eternum-agent/",
  directories: {
    "data/<world>/": {
      description: "Per-world agent memory and strategy files",
      files: {
        "soul.md": "Agent persona and guiding principles",
        "HEARTBEAT.md": "Periodic task checklist for the agent loop",
        "tasks/game.md": "Game strategy notes",
        "tasks/economy.md": "Economy management notes",
        "tasks/exploration.md": "Exploration notes",
        "tasks/combat.md": "Combat strategy notes",
        "tasks/priorities.md": "Current priorities",
        "tasks/learnings.md": "Accumulated learnings from gameplay",
      },
    },
    ".cartridge/<world>/": {
      description: "Per-world Cartridge Controller session artifacts",
      files: {
        "profile.json": "World profile (chain, rpc, torii, worldAddress)",
        "manifest.json": "Resolved manifest with live contract addresses",
        "policy.json": "Session policies",
        "session.json": "Controller session keypair",
        "auth.json": "Auth URL and status metadata",
        "auth-qr.png": "Compressed auth URL as QR code",
      },
    },
  },
};

export const RUNTIME_CONFIG_PATHS = [
  { path: "tickIntervalMs", description: "Tick interval in milliseconds", example: 30000 },
  { path: "loopEnabled", description: "Enable/disable the agent loop", example: false },
  { path: "modelProvider", description: "LLM provider to use", example: "openai" },
  { path: "modelId", description: "Model identifier", example: "gpt-4o" },
  { path: "dataDir", description: "Override the agent data directory", example: "/custom/path" },
];

export const DIAGNOSTICS = {
  command: "axis doctor",
  commonIssues: [
    {
      issue: "No worlds discovered",
      resolution: "Check network reachability and CARTRIDGE_API_BASE",
    },
    {
      issue: "--world is required for headless mode",
      resolution: "Pre-auth with axis auth and specify --world flag",
    },
    {
      issue: "Auth remains pending",
      resolution: 'Complete approval or run axis auth --redirect-url="..."',
    },
    {
      issue: "Password auth fails",
      resolution:
        "Verify username/password and that the account has a password credential on Cartridge",
    },
    {
      issue: "Session expired",
      resolution: "Re-run axis auth <world>. Sessions last 7 days.",
    },
  ],
};
