import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("root page exists", () => {
  const target = path.join(ROOT, "index.html");
  assert.equal(fs.existsSync(target), true, "index.html is missing");
});

test("core data file exists and has expected shape", () => {
  const target = path.join(ROOT, "data.json");
  assert.equal(fs.existsSync(target), true, "data.json is missing");
  const payload = JSON.parse(fs.readFileSync(target, "utf8"));
  assert.equal(typeof payload, "object");
  assert.equal(Array.isArray(payload.monthly), true, "monthly must be an array");
});

test("styles file exists", () => {
  const target = path.join(ROOT, "style.css");
  assert.equal(fs.existsSync(target), true, "style.css is missing");
});

