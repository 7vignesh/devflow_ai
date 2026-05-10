import Anthropic from "@anthropic-ai/sdk";

let anthropicClient: Anthropic | null = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return anthropicClient;
}

type RunClaudeArgs = {
  system: string;
  userMessage: string;
};

export async function runClaude({ system, userMessage }: RunClaudeArgs) {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const output =
    response.content
      .filter((chunk) => chunk.type === "text")
      .map((chunk) => chunk.text)
      .join("\n")
      .trim() || "No output was returned.";

  const tokensUsed = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  return {
    output,
    tokensUsed,
  };
}
