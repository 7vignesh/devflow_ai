# DevFlow AI

AI automation platform for dev agencies and technical recruiters, built with Next.js 14 App Router, Supabase Auth/Postgres, Anthropic, and Stripe.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template and fill values:

```bash
cp .env.example .env.local
```

3. Run the schema in Supabase SQL editor:

- `supabase/schema.sql`

4. Start development server:

```bash
npm run dev
```

## Environment variables

Define all variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_AGENCY`
- `GITHUB_TOKEN` (optional)

## Vercel deployment notes

1. Create a Vercel project and set the same env vars from `.env.example` in the Vercel dashboard.
2. Configure your production app URL in `NEXT_PUBLIC_APP_URL`.
3. Add Stripe webhook endpoint:
   - URL: `https://<your-domain>/api/stripe/webhook`
   - Events: `checkout.session.completed`
4. Set the webhook signing secret in `STRIPE_WEBHOOK_SECRET`.

## Useful scripts

```bash
npm run lint
npm run build
```
