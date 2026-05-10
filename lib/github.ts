import { GitHubProfileSummary, GitHubRepo } from "@/types";

const githubApi = "https://api.github.com";

function getHeaders() {
  if (!process.env.GITHUB_TOKEN) {
    return {} as Record<string, string>;
  }

  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  } as Record<string, string>;
}

export async function fetchGitHubProfile(username: string): Promise<GitHubProfileSummary> {
  const headers = getHeaders();
  const userUrl = `${githubApi}/users/${username}`;
  const reposUrl = `${githubApi}/users/${username}/repos?sort=updated&per_page=6`;

  const [userRes, reposRes] = await Promise.all([
    fetch(userUrl, { headers, next: { revalidate: 60 } }),
    fetch(reposUrl, { headers, next: { revalidate: 60 } }),
  ]);

  if (!userRes.ok) {
    throw new Error(`GitHub user lookup failed (${userRes.status}).`);
  }

  if (!reposRes.ok) {
    throw new Error(`GitHub repo lookup failed (${reposRes.status}).`);
  }

  const userData = await userRes.json();
  const reposData = (await reposRes.json()) as GitHubRepo[];

  const languages = Array.from(new Set(reposData.map((repo) => repo.language).filter(Boolean))) as string[];
  const mostStarredRepo = reposData.reduce<GitHubRepo | null>((best, repo) => {
    if (!best || repo.stargazers_count > best.stargazers_count) {
      return repo;
    }

    return best;
  }, null);

  return {
    username,
    name: userData.name,
    bio: userData.bio,
    avatarUrl: userData.avatar_url,
    followers: userData.followers,
    publicRepos: userData.public_repos,
    topRepos: reposData,
    mostStarredRepo,
    languages,
  };
}
