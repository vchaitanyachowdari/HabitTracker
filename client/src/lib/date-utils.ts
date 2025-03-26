import { format, isToday, isYesterday, isTomorrow, addDays, subDays, isSameDay } from "date-fns";

// Format a date to a readable string (Today, Yesterday, Tomorrow, or day of week)
export function formatDate(date: Date): string {
  if (isToday(date)) {
    return `Today, ${format(date, "MMMM d, yyyy")}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, "MMMM d, yyyy")}`;
  } else if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, "MMMM d, yyyy")}`;
  } else {
    return format(date, "EEEE, MMMM d, yyyy");
  }
}

// Get an array of dates for the past n days
export function getPastDays(days: number): Date[] {
  const result: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    result.push(subDays(today, i));
  }
  
  return result;
}

// Check if a given date is in the past
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// Check if a date is today or in the future
export function isTodayOrFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

// Get the week number of a date
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Check if two dates are in the same week
export function isSameWeek(dateA: Date, dateB: Date): boolean {
  const yearA = dateA.getFullYear();
  const yearB = dateB.getFullYear();
  const weekA = getWeekNumber(dateA);
  const weekB = getWeekNumber(dateB);
  
  return yearA === yearB && weekA === weekB;
}

// Format time (HH:MM format)
export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

// Get array of days for a month view
export function getDaysInMonthView(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  
  // Get all days in the month
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}
