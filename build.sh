#!/usr/bin/env bash
# Bundles src/ into a single self-contained index.html (three.js itself loads from a CDN).
set -e
mkdir -p dist
npx esbuild src/main.js --bundle --format=iife --minify --alias:three=./src/three-shim.cjs --outfile=dist/app.js --log-level=warning
node -e '
const fs=require("fs");const t=fs.readFileSync("template.html","utf8");const app=fs.readFileSync("dist/app.js","utf8").replace(/<\/script/g,"<\\/script");
fs.writeFileSync("index.html",t.replace("THREE_URL","https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js").replace("/*APP*/",()=>app));
console.log("index.html",fs.statSync("index.html").size,"bytes");'
