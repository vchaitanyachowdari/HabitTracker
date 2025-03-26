import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/hooks/use-habits";
import { useHabitRecords } from "@/hooks/use-habits";
import { Habit, HabitRecord, InsertHabitRecord } from "@shared/schema";
import { Plus, Check, X, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TodaysHabitsProps {
  onAddHabitClick: () => void;
}

export default function TodaysHabits({ onAddHabitClick }: TodaysHabitsProps) {
  const { habits, isLoading: habitsLoading } = useHabits();
  const { habitRecords, isLoading: recordsLoading } = useHabitRecords();
  const { toast } = useToast();
  const [updatingHabitId, setUpdatingHabitId] = useState<number | null>(null);

  // Get today's records
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const todaysRecords = habitRecords?.filter(
    record => format(new Date(record.date), "yyyy-MM-dd") === todayStr
  ) || [];
  
  // Get habit completion status
  const getHabitCompletion = (habitId: number) => {
    return todaysRecords.find(record => record.habitId === habitId)?.completed || false;
  };
  
  // Get habit streak
  const getHabitStreak = (habitId: number) => {
    if (!habitRecords) return 0;
    
    // Sort records for this habit by date descending
    const records = habitRecords
      .filter(record => record.habitId === habitId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let lastDate: Date | null = null;
    
    for (const record of records) {
      if (!record.completed) break;
      
      const recordDate = new Date(record.date);
      
      // Check if this is the first record or if it's consecutive with the last one
      if (lastDate === null) {
        streak = 1;
        lastDate = recordDate;
      } else {
        const dayDiff = Math.floor(
          (lastDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          streak++;
          lastDate = recordDate;
        } else if (dayDiff === 0) {
          // Same day, just continue
          lastDate = recordDate;
        } else {
          // Gap found, end streak
          break;
        }
      }
    }
    
    return streak;
  };
  
  // Toggle habit completion
  const toggleHabitCompletion = async (habit: Habit) => {
    try {
      setUpdatingHabitId(habit.id);
      
      const currentStatus = getHabitCompletion(habit.id);
      const todayDate = new Date();
      
      // Find existing record for today
      const existingRecord = todaysRecords.find(record => record.habitId === habit.id);
      
      const recordData: InsertHabitRecord = {
        habitId: habit.id,
        date: todayDate,
        completed: !currentStatus
      };
      
      if (existingRecord) {
        await apiRequest("PATCH", `/api/habit-records/${existingRecord.id}`, recordData);
      } else {
        await apiRequest("POST", "/api/habit-records", recordData);
      }
      
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/habit-records"] });
      
      toast({
        title: !currentStatus ? "Habit completed!" : "Habit marked as incomplete",
        description: !currentStatus
          ? `You completed ${habit.name}. Keep up the good work!`
          : `${habit.name} marked as not completed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update habit status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingHabitId(null);
    }
  };
  
  // Calculate percentage progress for streak
  const calculateStreakProgress = (habitId: number) => {
    const streak = getHabitStreak(habitId);
    
    // For simplicity, consider 30 days (monthly goal) as 100%
    // Adjust this calculation based on your habit frequency logic
    return Math.min(Math.round((streak / 30) * 100), 100);
  };
  
  const isLoading = habitsLoading || recordsLoading;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today's Habits</h3>
        <Button onClick={onAddHabitClick}>
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Habit
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : habits?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No habits created yet</h4>
          <p className="text-gray-600 mb-4">
            Start by creating your first habit to track your progress.
          </p>
          <Button onClick={onAddHabitClick}>
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add First Habit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits?.map((habit) => (
            <div 
              key={habit.id} 
              className="bg-white rounded-lg shadow overflow-hidden relative"
            >
              <div className={`absolute top-0 left-0 w-1 h-full bg-${habit.colorTag}`}></div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{habit.name}</h4>
                    <p className="text-sm text-gray-500">
                      {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                      {habit.reminderTime ? ` • ${habit.reminderTime}` : ''}
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${
                        getHabitCompletion(habit.id)
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                      onClick={() => toggleHabitCompletion(habit)}
                      disabled={updatingHabitId === habit.id}
                    >
                      {updatingHabitId === habit.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : getHabitCompletion(habit.id) ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Current streak</span>
                    <span className="font-medium text-gray-700">{getHabitStreak(habit.id)} days</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-gray-200 rounded">
                    <div 
                      className={`h-1 bg-${habit.colorTag} rounded`} 
                      style={{ width: `${calculateStreakProgress(habit.id)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
