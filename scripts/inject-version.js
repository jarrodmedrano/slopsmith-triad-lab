#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
const htmlPath = path.join(root, "screen.html");
const html = fs.readFileSync(htmlPath, "utf8");
const updated = html.replace(
  /(<span class="triadlab-version">)[^<]*(<\/span>)/,
  `$1v${version}$2`,
);
fs.writeFileSync(htmlPath, updated);
console.log(`screen.html version → v${version}`);
