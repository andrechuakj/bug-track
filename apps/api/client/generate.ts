import fs from 'node:fs';
import openapiTS, { astToString } from 'openapi-typescript';

const srcFile = process.env.SRC_PATH || '../openapi.json';
const src = new URL(srcFile, import.meta.url);

const generate = async () => {
  const ast = await openapiTS(src);
  const contents = astToString(ast);
  fs.writeFileSync('client/api.ts', contents);
};

console.log('Generating API client...');
await generate();
console.log('API client generated successfully.');
