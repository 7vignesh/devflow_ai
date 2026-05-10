import { cn } from "@/lib/utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-[0_20px_60px_-25px_rgba(79,70,229,0.35)]", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: DivProps) {
  return <h3 className={cn("text-lg font-semibold text-slate-100", className)} {...props} />;
}

export function CardDescription({ className, ...props }: DivProps) {
  return <p className={cn("text-sm text-slate-400", className)} {...props} />;
}
