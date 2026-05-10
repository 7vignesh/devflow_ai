export type UserPlan = "free" | "pro" | "agency";

export type ToolId =
  | "github_brief"
  | "jd_generator"
  | "onboarding"
  | "custom_workflow"
  | "outreach_email";

export type ClaudeRouteRequest = {
  tool: ToolId;
  input: Record<string, unknown> | string;
};

export type ClaudeRouteResponse = {
  output: string;
  tokensUsed: number;
  runsThisMonth: number;
  plan: UserPlan;
};

export type GitHubRepo = {
  name: string;
  html_url: string;
  stargazers_count: number;
  language: string | null;
};

export type GitHubProfileSummary = {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  followers: number;
  publicRepos: number;
  topRepos: GitHubRepo[];
  mostStarredRepo: GitHubRepo | null;
  languages: string[];
};
