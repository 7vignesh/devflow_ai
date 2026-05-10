import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(value: string, max = 90) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max)}...`;
}

export function currentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}
