import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const owner = process.env.UPDATES_OWNER || "CS-wude";
const repo = process.env.UPDATES_REPO || "javaweb";
const author = process.env.UPDATES_AUTHOR || owner;
const token = process.env.GITHUB_TOKEN || "";
const pageSize = 100;
const maxPages = 50;

const identifierPattern = /^[A-Za-z0-9_.-]+$/;

for (const [name, value] of Object.entries({ owner, repo, author })) {
  if (!identifierPattern.test(value)) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
}

const headers = {
  Accept: "application/vnd.github.full+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "wude-portfolio-updates-sync",
};

if (token) headers.Authorization = `Bearer ${token}`;

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const hasNextPage = (linkHeader) =>
  String(linkHeader || "")
    .split(",")
    .some((part) => part.includes('rel="next"'));

const fetchIssuePage = async (page) => {
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`);
  url.searchParams.set("state", "all");
  url.searchParams.set("creator", author);
  url.searchParams.set("sort", "created");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", String(pageSize));
  url.searchParams.set("page", String(page));

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(20_000),
    });

    if (response.ok) {
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error(`GitHub returned a non-array response for page ${page}`);
      }
      return { data, link: response.headers.get("Link") || "" };
    }

    const retryable = [429, 500, 502, 503, 504].includes(response.status);
    if (retryable && attempt < 3) {
      await wait(attempt * 1_500);
      continue;
    }

    const responseText = (await response.text()).slice(0, 300);
    const remaining = response.headers.get("X-RateLimit-Remaining");
    const reset = response.headers.get("X-RateLimit-Reset");
    throw new Error(
      `GitHub request failed (${response.status}); remaining=${remaining ?? "unknown"}; reset=${reset ?? "unknown"}; ${responseText}`,
    );
  }

  throw new Error(`GitHub request failed after retries for page ${page}`);
};

const assertIssue = (issue) => {
  if (!Number.isInteger(issue?.number) || issue.number <= 0) {
    throw new Error("GitHub returned an issue with an invalid number");
  }
  if (typeof issue.title !== "string" || !issue.title.trim()) {
    throw new Error(`Issue #${issue.number} has an invalid title`);
  }
  if (!['open', 'closed'].includes(issue.state)) {
    throw new Error(`Issue #${issue.number} has an invalid state`);
  }
  if (Number.isNaN(Date.parse(issue.created_at))) {
    throw new Error(`Issue #${issue.number} has an invalid created_at value`);
  }
  if (issue.user?.login?.toLowerCase() !== author.toLowerCase()) {
    throw new Error(`Issue #${issue.number} does not belong to ${author}`);
  }
};

const rawIssues = [];

for (let page = 1; page <= maxPages; page += 1) {
  const result = await fetchIssuePage(page);
  rawIssues.push(...result.data);
  if (!hasNextPage(result.link)) break;
  if (page === maxPages) {
    throw new Error(`Issue pagination exceeded the ${maxPages}-page safety limit`);
  }
}

const issues = rawIssues
  .filter((issue) => !issue.pull_request)
  .filter((issue) => issue.user?.login?.toLowerCase() === author.toLowerCase())
  .map((issue) => {
    assertIssue(issue);
    return {
      number: issue.number,
      state: issue.state,
      title: issue.title.trim(),
      body: typeof issue.body === "string" ? issue.body : "",
      body_text: typeof issue.body_text === "string" ? issue.body_text : "",
      body_html: typeof issue.body_html === "string" ? issue.body_html : "",
      created_at: issue.created_at,
      updated_at: issue.updated_at || issue.created_at,
      closed_at: issue.closed_at || null,
      comments: Number.isInteger(issue.comments) ? issue.comments : 0,
      html_url: `https://github.com/${owner}/${repo}/issues/${issue.number}`,
      user: {
        login: author,
      },
      labels: Array.isArray(issue.labels)
        ? issue.labels
            .filter((label) => label && typeof label === "object")
            .map((label) => ({
              name: String(label.name || "").trim(),
              color: /^[0-9a-f]{6}$/i.test(label.color || "")
                ? label.color.toLowerCase()
                : "c9cbc4",
            }))
            .filter((label) => label.name)
        : [],
    };
  })
  .sort((left, right) => {
    const dateDifference = Date.parse(right.created_at) - Date.parse(left.created_at);
    return dateDifference || right.number - left.number;
  });

const numbers = new Set();
for (const issue of issues) {
  if (numbers.has(issue.number)) {
    throw new Error(`Duplicate issue number in snapshot: ${issue.number}`);
  }
  numbers.add(issue.number);
}

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    owner,
    repo,
    author,
    issuesUrl: `https://github.com/${owner}/${repo}/issues`,
  },
  openIssueCount: issues.filter((issue) => issue.state === "open").length,
  issues,
};

const outputDirectory = path.resolve("data");
await mkdir(outputDirectory, { recursive: true });

const formattedJson = `${JSON.stringify(payload, null, 2)}\n`;
const scriptJson = JSON.stringify(payload)
  .replaceAll("\u2028", "\\u2028")
  .replaceAll("\u2029", "\\u2029");

await writeFile(path.join(outputDirectory, "updates.json"), formattedJson, "utf8");
await writeFile(
  path.join(outputDirectory, "updates-data.js"),
  `window.WUDE_UPDATES_SNAPSHOT = ${scriptJson};\n`,
  "utf8",
);

console.log(
  `Generated updates snapshot with ${issues.length} issues (${payload.openIssueCount} open).`,
);
