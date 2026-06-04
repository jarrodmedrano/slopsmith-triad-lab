#!/usr/bin/env node
// Copies the version from package.json into plugin.json.
// Run automatically via the npm `version` lifecycle hook.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const pluginPath = path.join(root, "plugin.json");
const plugin = JSON.parse(fs.readFileSync(pluginPath, "utf8"));

plugin.version = pkg.version;
fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2) + "\n");
console.log(`plugin.json version → ${pkg.version}`);
