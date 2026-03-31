import { buildApp } from "./app.js";
import { getEnv } from "./config/env.js";

const env = getEnv();

async function main() {
  const app = await buildApp({ env });
  await app.listen({ port: env.port, host: "0.0.0.0" });
  console.log(`Backend API listening on port ${env.port}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
