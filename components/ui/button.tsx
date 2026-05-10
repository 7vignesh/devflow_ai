"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "default" &&
          "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:scale-[1.01] hover:from-indigo-400 hover:to-violet-400",
        variant === "outline" && "border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800",
        variant === "ghost" && "bg-transparent text-slate-300 hover:bg-slate-900 hover:text-slate-100",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-500",
        className,
      )}
      {...props}
    />
  );
}
