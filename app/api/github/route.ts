import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubProfile } from "@/lib/github";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim();
  if (!username) {
    return NextResponse.json({ error: "Missing username query param." }, { status: 400 });
  }

  try {
    const profile = await fetchGitHubProfile(username);
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub lookup failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
