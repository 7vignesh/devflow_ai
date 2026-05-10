import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "default" && "border border-slate-700 bg-slate-900 text-slate-300",
        tone === "success" && "border border-emerald-800 bg-emerald-950/60 text-emerald-300",
        tone === "warning" && "border border-amber-800 bg-amber-950/60 text-amber-300",
        className,
      )}
      {...props}
    />
  );
}
