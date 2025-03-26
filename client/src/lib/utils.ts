import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date as MM/DD/YYYY
export function formatDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Calculate streak from array of boolean values (true = completed, false = missed)
export function calculateStreak(completionArray: boolean[]): number {
  let currentStreak = 0;
  
  for (let i = 0; i < completionArray.length; i++) {
    if (completionArray[i]) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return currentStreak;
}

// Calculate completion percentage
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Generate color class based on completion rate
export function getCompletionColorClass(rate: number): string {
  if (rate >= 80) return "bg-green-500";
  if (rate >= 60) return "bg-green-400";
  if (rate >= 40) return "bg-yellow-500";
  if (rate >= 20) return "bg-yellow-400";
  return "bg-red-500";
}
