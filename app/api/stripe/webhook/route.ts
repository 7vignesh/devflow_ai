import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook signature or secret missing." }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const selectedPlan = session.metadata?.selected_plan;

    if (userId && (selectedPlan === "pro" || selectedPlan === "agency")) {
      await supabase
        .from("users")
        .update({
          plan: selectedPlan,
          stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        })
        .eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
