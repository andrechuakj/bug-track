import fs from 'node:fs';
import openapiTS, { astToString } from 'openapi-typescript';

const host = process.env.BACKEND_URL || 'http://localhost:8000';
const url = `${host}/openapi.json`;

// Wait 1 second for the backend to start
Bun.sleep(1000);

let lastHash: number | null = null;

const generate = async () => {
  const ast = await openapiTS(new URL(url));
  const contents = astToString(ast);
  const hash = Bun.hash.crc32(contents);
  if (hash === lastHash) {
    return;
  }
  lastHash = hash;
  console.log('Changes detected, updating API client...');
  fs.writeFileSync('client/api.ts', contents);
};

// Generate the API client every other second
// TODO: Figure out a less hacky way besides polling
setInterval(generate, 2000);
