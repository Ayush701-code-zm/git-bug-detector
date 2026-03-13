const GITHUB_API_BASE = "https://api.github.com";

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

interface GitHubCommitDetail {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  files?: Array<{
    filename: string;
    patch?: string;
    status: string;
  }>;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
  diff?: string;
}

function getAuthHeaders(tokenOverride?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
  const token = tokenOverride || process.env.GITHUB_TOKEN;
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/,
    /^([^/]+)\/([^/.]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
  }
  return null;
}

export async function getRepoCommits(
  owner: string,
  repo: string,
  branch?: string,
  limit = 10,
  token?: string
): Promise<CommitInfo[]> {
  const branchParam = branch ? `?sha=${branch}` : "?sha=HEAD";
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits${branchParam}&per_page=${limit}`;

  const res = await fetch(url, { headers: getAuthHeaders(token) });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || `GitHub API error: ${res.status} ${res.statusText}`
    );
  }

  const data: GitHubCommit[] = await res.json();
  return data.map((c) => ({
    sha: c.sha,
    message: c.commit.message.split("\n")[0],
    author: c.commit.author.name,
    date: c.commit.author.date,
  }));
}

export async function getFileContents(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  token?: string
): Promise<string | null> {
  const cleanPath = path.replace(/^\//, "");
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${cleanPath}?ref=${ref}`;

  const res = await fetch(url, { headers: getAuthHeaders(token) });
  if (!res.ok) return null;

  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  }
  return null;
}

export async function createGitHubIssue(
  owner: string,
  repo: string,
  title: string,
  body: string,
  token: string
): Promise<{ url: string; number: number }> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...getAuthHeaders(token) as Record<string, string>,
    },
    body: JSON.stringify({ title, body, labels: ["bug"] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  return { url: data.html_url, number: data.number };
}

export async function getCommitDetails(
  owner: string,
  repo: string,
  sha: string,
  token?: string
): Promise<CommitInfo> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`;

  const res = await fetch(url, { headers: getAuthHeaders(token) });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || `GitHub API error: ${res.status} ${res.statusText}`
    );
  }

  const data: GitHubCommitDetail = await res.json();
  const patches = (data.files || [])
    .filter((f) => f.patch)
    .map((f) => `--- ${f.filename}\n+++ ${f.filename}\n${f.patch}`)
    .join("\n\n");

  return {
    sha: data.sha,
    message: data.commit.message.split("\n")[0],
    author: data.commit.author.name,
    date: data.commit.author.date,
    diff: patches || undefined,
  };
}
