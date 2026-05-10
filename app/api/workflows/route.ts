import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient as createAuthClient } from "@/lib/supabase/server";

const workflowSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  steps: z.unknown(),
});

export async function GET() {
  const authClient = createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workflows")
    .select("id, name, description, steps, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load workflows." }, { status: 500 });
  }

  return NextResponse.json({ workflows: data ?? [] });
}

export async function POST(req: NextRequest) {
  const authClient = createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = workflowSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid workflow payload." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("workflows")
    .insert({
      user_id: userId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      steps: parsed.data.steps,
    })
    .select("id, name, description, steps, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save workflow." }, { status: 500 });
  }

  return NextResponse.json({ workflow: data });
}
