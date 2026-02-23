import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const htmlPages = [
  "index.html",
  "airbnb/index.html",
  "airbnb/aircover/index.html",
  "alivo/index.html",
  "ambience/index.html",
  "circle/index.html",
  "consensys/index.html",
  "ey/index.html",
  "fedex/index.html",
  "fetch/index.html",
  "happymoney/index.html",
  "kraken/index.html",
  "quince/index.html",
  "reku/index.html",
  "root/index.html",
  "scopely/index.html",
  "stellantis/index.html",
  "torq/index.html",
  "viant/index.html",
];

for (const pagePath of htmlPages) {
  test(`page sanity: ${pagePath}`, () => {
    const absolute = path.join(ROOT, pagePath);
    assert.equal(fs.existsSync(absolute), true, `${pagePath} is missing`);
    const html = fs.readFileSync(absolute, "utf8");
    assert.ok(html.length > 0, `${pagePath} is empty`);
    assert.ok(/<html[\s>]/i.test(html), `${pagePath} does not include an <html> tag`);

    const dir = path.dirname(pagePath);
    const pageScopedData = dir === "." ? "data.json" : path.join(dir, "data.json");
    const hasPageScopedData = fs.existsSync(path.join(ROOT, pageScopedData));
    const hasRootData = fs.existsSync(path.join(ROOT, "data.json"));
    assert.equal(
      hasPageScopedData || hasRootData,
      true,
      `${pageScopedData} is missing for ${pagePath}, and no root data.json fallback exists`
    );
  });
}
