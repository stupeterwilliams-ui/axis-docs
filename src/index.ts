import { app } from './lib/agent.js';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`Starting Axis docs agent on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
