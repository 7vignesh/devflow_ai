import Link from "next/link";
import { ArrowRight, Bot, Brain, CheckCircle2, ShieldCheck, Sparkles, Workflow, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <p className="text-lg font-semibold">DevFlow AI</p>
        <div className="flex gap-2">
          <Link href="/sign-in">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Start free</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              Built for agencies and recruiter teams
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              <span className="text-gradient">AI automations</span> for modern dev teams
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              DevFlow AI turns repetitive recruiting and delivery workflows into reliable AI operations. Run ready-made tools,
              generate custom automation plans, and track every run with usage + token visibility.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up">
                <Button>Start free</Button>
              </Link>
              <a href="#demo">
                <Button variant="outline">See live capabilities</Button>
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Recruiter-grade GitHub briefs", "Developer-first JD generation", "Automation workflow builder"].map((item) => (
                <div key={item} className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <Card className="animate-float-slow overflow-hidden">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-sm text-slate-300">Workflow Preview</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-md border border-slate-700 bg-slate-950 p-3 text-sm">Trigger: New candidate submitted in Airtable</div>
                <div className="rounded-md border border-slate-700 bg-slate-950 p-3 text-sm">Step 1: Fetch GitHub profile + top repos</div>
                <div className="rounded-md border border-slate-700 bg-slate-950 p-3 text-sm">Step 2: Claude generates recruiter brief + outreach angle</div>
                <div className="rounded-md border border-slate-700 bg-slate-950 p-3 text-sm">Step 3: Save output + tokens to run history</div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Estimated build time: 2.5 hours
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="demo" className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
        <Card className="space-y-2 transition hover:-translate-y-1">
          <Bot className="h-5 w-5 text-indigo-300" />
          <h3 className="font-semibold">GitHub Brief</h3>
          <p className="text-sm text-slate-400">Analyze public dev profiles into recruiter-ready summaries, stack signals, and role fit.</p>
        </Card>
        <Card className="space-y-2 transition hover:-translate-y-1">
          <Sparkles className="h-5 w-5 text-indigo-300" />
          <h3 className="font-semibold">JD Generator</h3>
          <p className="text-sm text-slate-400">Create high-quality engineering job descriptions with realistic responsibilities and expectations.</p>
        </Card>
        <Card className="space-y-2 transition hover:-translate-y-1">
          <Workflow className="h-5 w-5 text-indigo-300" />
          <h3 className="font-semibold">Workflow Builder</h3>
          <p className="text-sm text-slate-400">Describe an idea in plain English and get a structured trigger-step-data integration plan.</p>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">What DevFlow AI gives you</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-300">
              <Brain className="h-4 w-4" />
              <p className="text-sm font-medium">AI Execution Layer</p>
            </div>
            <p className="text-sm text-slate-400">Centralized Claude-backed tool execution with prompts tuned for recruiting and delivery operations.</p>
            <p className="text-sm text-slate-400">Every run is logged with inputs, outputs, timestamp, and token usage so teams can optimize quality and cost.</p>
          </Card>
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-medium">Productized SaaS Controls</p>
            </div>
            <p className="text-sm text-slate-400">Built-in auth, monthly usage limits by plan, Stripe upgrade flow, and plan-gated run history.</p>
            <p className="text-sm text-slate-400">Designed for solo recruiters up to agencies needing scalable AI operations with predictable billing.</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "Describe", desc: "Input a username, role brief, or plain-English automation request." },
            { icon: Brain, title: "Generate", desc: "Claude produces structured output tailored to the selected tool context." },
            { icon: CheckCircle2, title: "Track", desc: "Outputs and usage are saved so you can iterate with confidence and visibility." },
          ].map((step, index) => (
            <Card key={step.title} className="animate-float-delay">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-300">Step {index + 1}</p>
              <step.icon className="h-5 w-5 text-indigo-300" />
              <p className="mt-2 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-slate-400">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-lg font-semibold">Free</p>
            <p className="mt-1 text-sm text-slate-400">$0 / mo</p>
            <p className="mt-4 text-sm text-slate-300">50 runs/month, core tools, personal workspace.</p>
          </Card>
          <Card className="border-indigo-500/40 bg-indigo-950/20">
            <p className="text-lg font-semibold">Pro</p>
            <p className="mt-1 text-sm text-slate-400">$149 / mo</p>
            <p className="mt-4 text-sm text-slate-300">500 runs, all tools, run history, API access.</p>
          </Card>
          <Card>
            <p className="text-lg font-semibold">Agency</p>
            <p className="mt-1 text-sm text-slate-400">$399 / mo</p>
            <p className="mt-4 text-sm text-slate-300">Unlimited runs, team seats, white-label exports, priority support.</p>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-4 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-slate-400">
          <span>DevFlow AI · AI Automation Platform</span>
          <Link href="/sign-up" className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200">
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
