import { useQuery } from "@tanstack/react-query";
import { Habit, HabitRecord } from "@shared/schema";

// Hook to fetch all habits
export function useHabits() {
  const { data, isLoading, error, refetch } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  return {
    habits: data,
    isLoading,
    error,
    refetch
  };
}

// Hook to fetch a specific habit by ID
export function useHabit(id?: number) {
  const { data, isLoading, error } = useQuery<Habit>({
    queryKey: [`/api/habits/${id}`],
    enabled: id !== undefined,
  });

  return {
    habit: data,
    isLoading,
    error
  };
}

// Hook to fetch habit records with optional filters
export function useHabitRecords(habitId?: number, startDate?: Date, endDate?: Date) {
  const queryString = new URLSearchParams();
  
  if (habitId !== undefined) {
    queryString.append("habitId", habitId.toString());
  }
  
  if (startDate) {
    queryString.append("startDate", startDate.toISOString());
  }
  
  if (endDate) {
    queryString.append("endDate", endDate.toISOString());
  }
  
  const queryUrl = `/api/habit-records${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  
  const { data, isLoading, error, refetch } = useQuery<HabitRecord[]>({
    queryKey: [queryUrl],
  });

  return {
    habitRecords: data,
    isLoading,
    error,
    refetch
  };
}
