import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient as createAuthClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  plan: z.enum(["pro", "agency"]).default("pro"),
});

export async function POST(req: NextRequest) {
  const authClient = createAuthClient();
  const {
    data: { user: authUser },
  } = await authClient.auth.getUser();
  const userId = authUser?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload." }, { status: 400 });
  }

  const plan = parsed.data.plan;
  const priceId = plan === "agency" ? process.env.STRIPE_PRICE_AGENCY : process.env.STRIPE_PRICE_PRO;
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price ID is missing." }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  const email = authUser.email;
  if (!email) {
    return NextResponse.json({ error: "No email found for user." }, { status: 400 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user?.stripe_customer_id ?? undefined,
    customer_email: user?.stripe_customer_id ? undefined : email,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      user_id: userId,
      selected_plan: plan,
    },
    success_url: `${appUrl}/settings?success=1`,
    cancel_url: `${appUrl}/settings?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
