#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Repo Optimization Intelligence Agent (read-only by default)
 *
 * Uses local GitHub snapshot files to identify quality/process optimization opportunities:
 * - project-details.json (repo-level details)
 * - data.json (activity/commit aggregates)
 *
 * Optional:
 *   --refresh  -> refresh snapshots first using existing fetch scripts (requires GITHUB_TOKEN)
 *   --autofix  -> include patch-ready recommendation blocks (advisory only; no repo writes)
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PROJECT_DETAILS_PATH = path.join(ROOT, "project-details.json");
const ACTIVITY_PATH = path.join(ROOT, "data.json");
const REPORT_DIR = path.join(__dirname, "reports");
const REPORT_MD_PATH = path.join(REPORT_DIR, "repo-intel-report.md");
const REPORT_JSON_PATH = path.join(REPORT_DIR, "repo-intel-report.json");
const REPORT_CSV_PATH = path.join(REPORT_DIR, "repo-intel-opportunities.csv");

function parseArgs(argv) {
  const args = {
    limit: 5,
    recentDays: 90,
    refresh: false,
    autofix: false,
    exportCsv: false,
    repo: "",
    minPriority: Number.NEGATIVE_INFINITY,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--limit") args.limit = Number(argv[++i] || 5);
    else if (token === "--recent-days") args.recentDays = Number(argv[++i] || 90);
    else if (token === "--refresh") args.refresh = true;
    else if (token === "--autofix") args.autofix = true;
    else if (token === "--export-csv") args.exportCsv = true;
    else if (token === "--repo") args.repo = String(argv[++i] || "").trim();
    else if (token === "--min-priority") args.minPriority = Number(argv[++i] || 0);
  }
  return args;
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function runRefresh() {
  console.log("Refreshing GitHub snapshots...");
  const fetchDetails = spawnSync("node", ["scripts/fetch-project-details.js"], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (fetchDetails.status !== 0) {
    throw new Error("Failed refreshing project details");
  }

  const fetchActivity = spawnSync("node", ["scripts/fetch-github.js"], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (fetchActivity.status !== 0) {
    throw new Error("Failed refreshing activity data");
  }
}

function daysSince(isoDate) {
  if (!isoDate) return Number.POSITIVE_INFINITY;
  const now = Date.now();
  const then = Date.parse(isoDate);
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function normalizeFileSet(files) {
  return new Set((files || []).map((f) => (f.path || "").toLowerCase()));
}

function hasAnyPath(fileSet, candidates) {
  return candidates.some((p) => fileSet.has(p.toLowerCase()));
}

function hasPrefix(fileSet, prefixes) {
  for (const file of fileSet) {
    for (const prefix of prefixes) {
      if (file.startsWith(prefix.toLowerCase())) return true;
    }
  }
  return false;
}

function summarizeRepo(repo) {
  const fileSet = normalizeFileSet(repo.files);
  const readmeLength = (repo.readme || "").trim().length;
  const hasReadme = hasAnyPath(fileSet, ["readme.md", "readme"]);
  const hasCI = hasPrefix(fileSet, [".github/workflows/", ".circleci/"]);
  const hasGitHubDir = hasAnyPath(fileSet, [".github"]);
  const hasTests =
    hasPrefix(fileSet, ["tests/", "__tests__/", "test/"]) ||
    hasAnyPath(fileSet, [
      "pytest.ini",
      "tox.ini",
      "jest.config.js",
      "vitest.config.ts",
      "playwright.config.ts",
      "cypress.config.ts",
    ]);
  const hasContribGuide = hasAnyPath(fileSet, ["contributing.md"]);
  const hasSecurityPolicy = hasAnyPath(fileSet, ["security.md", ".github/security.md"]);
  const hasDependabot = hasAnyPath(fileSet, [".github/dependabot.yml", ".github/dependabot.yaml"]);
  const hasCodeowners = hasAnyPath(fileSet, [".github/codeowners", "codeowners"]);
  const commitMessages = (repo.recentCommits || []).map((c) => (c.message || "").toLowerCase());
  const bugFixCommitCount = commitMessages.filter((m) =>
    /(fix|bug|hotfix|patch|workaround|revert)/.test(m)
  ).length;

  return {
    name: repo.name,
    fullName: repo.fullName,
    url: repo.url,
    isPrivate: Boolean(repo.isPrivate),
    language: repo.language || "Unknown",
    pushedAt: repo.pushedAt,
    daysSincePush: daysSince(repo.pushedAt),
    readmeLength,
    hasReadme,
    hasCI,
    hasGitHubDir,
    hasTests,
    hasContribGuide,
    hasSecurityPolicy,
    hasDependabot,
    hasCodeowners,
    bugFixCommitCount,
    filesCount: Array.isArray(repo.files) ? repo.files.length : 0,
    commitsSampleSize: Array.isArray(repo.recentCommits) ? repo.recentCommits.length : 0,
  };
}

function opportunity(repo, key, title, evidence, impact, effort, nextAction, category) {
  const priority = impact * 2 - effort;
  return {
    repo: repo.name,
    repoUrl: repo.url,
    key,
    title,
    evidence,
    impact,
    effort,
    priority,
    category,
    nextAction,
  };
}

function buildOpportunities(repo) {
  const ops = [];

  if (!repo.hasCI && !repo.hasGitHubDir) {
    ops.push(
      opportunity(
        repo,
        "no-ci",
        "Add baseline CI pipeline",
        "No CI workflow detected in top-level repo structure.",
        5,
        2,
        "Create .github/workflows/ci.yml with lint + test + build checks.",
        "quality-gate"
      )
    );
  }
  if (!repo.hasCI && repo.hasGitHubDir) {
    ops.push(
      opportunity(
        repo,
        "ci-unverified",
        "Verify CI workflow detection",
        "Top-level .github directory exists, but workflow file was not observed in current snapshot.",
        3,
        1,
        "Confirm presence of .github/workflows/*.yml and improve scanner to inspect nested paths.",
        "quality-gate"
      )
    );
  }

  if (!repo.hasTests) {
    ops.push(
      opportunity(
        repo,
        "low-test-signal",
        "Establish minimal automated test suite",
        "No test directory/config detected from repository snapshot.",
        5,
        3,
        "Add smoke tests for critical paths and gate PRs with test command.",
        "reliability"
      )
    );
  }

  if (!repo.hasReadme || repo.readmeLength < 500) {
    ops.push(
      opportunity(
        repo,
        "readme-thin",
        "Improve README quality for onboarding",
        repo.hasReadme
          ? `README appears short (${repo.readmeLength} chars).`
          : "README not detected.",
        3,
        1,
        "Document setup, run, architecture, and validation steps in README.md.",
        "developer-experience"
      )
    );
  }

  if (!repo.hasContribGuide) {
    ops.push(
      opportunity(
        repo,
        "missing-contrib-guide",
        "Add CONTRIBUTING guide",
        "No CONTRIBUTING.md detected.",
        3,
        1,
        "Create CONTRIBUTING.md with branch, PR, review, and test expectations.",
        "process"
      )
    );
  }

  if (!repo.hasDependabot) {
    ops.push(
      opportunity(
        repo,
        "missing-dependabot",
        "Enable dependency update automation",
        "Dependabot config not found.",
        4,
        1,
        "Add .github/dependabot.yml for weekly dependency checks.",
        "security-maintenance"
      )
    );
  }

  if (!repo.hasSecurityPolicy) {
    ops.push(
      opportunity(
        repo,
        "missing-security-policy",
        "Add security disclosure policy",
        "SECURITY.md not detected.",
        3,
        1,
        "Add SECURITY.md with reporting channel and SLAs.",
        "security-governance"
      )
    );
  }

  if (!repo.hasCodeowners) {
    ops.push(
      opportunity(
        repo,
        "missing-codeowners",
        "Define code ownership",
        "CODEOWNERS not detected.",
        3,
        1,
        "Add CODEOWNERS to improve review routing and accountability.",
        "governance"
      )
    );
  }

  if (repo.bugFixCommitCount >= 4) {
    ops.push(
      opportunity(
        repo,
        "bugfix-churn",
        "Investigate recurring bug-fix churn",
        `${repo.bugFixCommitCount}/${repo.commitsSampleSize} sampled recent commits include fix/bug/hotfix patterns.`,
        4,
        3,
        "Run RCA on top 3 recurring defects and add regression tests.",
        "quality-trend"
      )
    );
  }

  return ops.sort((a, b) => b.priority - a.priority || b.impact - a.impact);
}

function buildPatchHints(opportunities) {
  return opportunities.map((op) => {
    if (op.key === "no-ci") {
      return {
        key: op.key,
        file: ".github/workflows/ci.yml",
        snippet:
          "name: CI\non: [pull_request, push]\njobs:\n  checks:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo \"add lint/test/build commands\"",
      };
    }
    if (op.key === "missing-dependabot") {
      return {
        key: op.key,
        file: ".github/dependabot.yml",
        snippet:
          "version: 2\nupdates:\n  - package-ecosystem: \"npm\"\n    directory: \"/\"\n    schedule:\n      interval: \"weekly\"",
      };
    }
    if (op.key === "missing-security-policy") {
      return {
        key: op.key,
        file: "SECURITY.md",
        snippet:
          "# Security Policy\n## Reporting\nPlease report vulnerabilities privately.\n## Response Time\nInitial response within 72 hours.",
      };
    }
    return null;
  }).filter(Boolean);
}

function buildSummary(scopedRepos, opportunities) {
  const topOps = [...opportunities]
    .sort((a, b) => b.priority - a.priority || b.impact - a.impact)
    .slice(0, 10);
  const byCategory = {};
  opportunities.forEach((op) => {
    byCategory[op.category] = (byCategory[op.category] || 0) + 1;
  });

  return {
    analyzedRepoCount: scopedRepos.length,
    generatedAt: new Date().toISOString(),
    topOpportunities: topOps,
    categoryDistribution: byCategory,
  };
}

function toMarkdown(summary, scopedRepos, repoOpMap, autofixHints) {
  const lines = [];
  lines.push("# Repo Optimization Intelligence Report");
  lines.push("");
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push(`Repos analyzed: ${summary.analyzedRepoCount}`);
  lines.push("");
  lines.push("## Top Opportunities");
  lines.push("");
  summary.topOpportunities.forEach((op, i) => {
    lines.push(
      `${i + 1}. **${op.title}** (${op.repo}) | priority=${op.priority}, impact=${op.impact}, effort=${op.effort}`
    );
    lines.push(`   - Evidence: ${op.evidence}`);
    lines.push(`   - Next action: ${op.nextAction}`);
  });

  lines.push("");
  lines.push("## Repo Breakdowns");
  lines.push("");
  scopedRepos.forEach((repo) => {
    lines.push(`### ${repo.name}`);
    lines.push(`- URL: ${repo.url}`);
    lines.push(`- Last push: ${repo.pushedAt || "unknown"} (${repo.daysSincePush} days ago)`);
    lines.push(`- Language: ${repo.language}`);
    lines.push(`- CI: ${repo.hasCI ? "yes" : "no"}, Tests: ${repo.hasTests ? "yes" : "no"}, README: ${repo.hasReadme ? "yes" : "no"}`);

    const ops = repoOpMap[repo.name] || [];
    if (ops.length === 0) {
      lines.push("- Opportunities: none detected by current heuristics");
    } else {
      ops.forEach((op) => {
        lines.push(`- ${op.title} [priority ${op.priority}]`);
        lines.push(`  - Evidence: ${op.evidence}`);
        lines.push(`  - Action: ${op.nextAction}`);
      });
    }
    lines.push("");
  });

  if (autofixHints.length > 0) {
    lines.push("## Autofix Hints (Advisory)");
    lines.push("");
    autofixHints.forEach((hint) => {
      lines.push(`### ${hint.key}`);
      lines.push(`Suggested file: \`${hint.file}\``);
      lines.push("```yaml");
      lines.push(hint.snippet);
      lines.push("```");
      lines.push("");
    });
  }

  return lines.join("\n");
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, "\"\"")}"`;
  }
  return str;
}

function buildCsv(summary, opportunities) {
  const headers = [
    "generated_at",
    "repo",
    "repo_url",
    "key",
    "title",
    "category",
    "priority",
    "impact",
    "effort",
    "evidence",
    "next_action",
    "status",
    "owner",
    "target_date",
    "notes",
  ];

  const sortedOps = [...opportunities].sort(
    (a, b) => b.priority - a.priority || b.impact - a.impact || a.repo.localeCompare(b.repo)
  );
  const rows = sortedOps.map((op) => [
    summary.generatedAt,
    op.repo,
    op.repoUrl,
    op.key,
    op.title,
    op.category,
    op.priority,
    op.impact,
    op.effort,
    op.evidence,
    op.nextAction,
    "todo",
    "",
    "",
    "",
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.refresh) {
    runRefresh();
  }

  const projects = safeReadJson(PROJECT_DETAILS_PATH);
  safeReadJson(ACTIVITY_PATH);

  const normalized = projects.map(summarizeRepo);
  let scopedRepos = normalized
    .filter((r) => r.daysSincePush <= args.recentDays)
    .sort((a, b) => a.daysSincePush - b.daysSincePush)
    .slice(0, args.limit);
  if (args.repo) {
    const filterNeedle = args.repo.toLowerCase();
    scopedRepos = scopedRepos.filter(
      (r) =>
        r.name.toLowerCase() === filterNeedle ||
        r.fullName.toLowerCase() === filterNeedle
    );
  }

  const repoOpMap = {};
  let allOps = [];
  scopedRepos.forEach((repo) => {
    const ops = buildOpportunities(repo);
    const filteredOps = ops.filter((op) => op.priority >= args.minPriority);
    repoOpMap[repo.name] = filteredOps;
    allOps = allOps.concat(filteredOps);
  });

  const summary = buildSummary(scopedRepos, allOps);
  const autofixHints = args.autofix ? buildPatchHints(summary.topOpportunities) : [];

  const payload = {
    args,
    summary,
    repos: scopedRepos,
    opportunitiesByRepo: repoOpMap,
    autofixHints,
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(payload, null, 2));
  fs.writeFileSync(REPORT_MD_PATH, toMarkdown(summary, scopedRepos, repoOpMap, autofixHints));
  if (args.exportCsv) {
    fs.writeFileSync(REPORT_CSV_PATH, buildCsv(summary, allOps));
  }

  console.log(`Report written:\n- ${REPORT_MD_PATH}\n- ${REPORT_JSON_PATH}`);
  if (args.exportCsv) {
    console.log(`- ${REPORT_CSV_PATH}`);
  }
  console.log(`Top opportunities generated: ${summary.topOpportunities.length}`);
}

main();
