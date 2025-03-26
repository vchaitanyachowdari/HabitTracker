import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabits } from "@/hooks/use-habits";
import { useHabitRecords } from "@/hooks/use-habits";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Calendar() {
  const [date, setDate] = useState<Date>(new Date());
  const { habits, isLoading: habitsLoading } = useHabits();
  const { habitRecords, isLoading: recordsLoading } = useHabitRecords();

  const getCompletedHabitsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return habitRecords?.filter(
      (record) => 
        format(new Date(record.date), "yyyy-MM-dd") === dateString &&
        record.completed
    ) || [];
  };

  const completedHabitsForSelectedDate = getCompletedHabitsForDate(date);
  
  // Create a data structure that maps dates to arrays of completed habits
  const completedHabitsByDate = habitRecords?.reduce((acc, record) => {
    if (record.completed) {
      const dateStr = format(new Date(record.date), "yyyy-MM-dd");
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(record.habitId);
    }
    return acc;
  }, {} as Record<string, number[]>) || {};

  // Custom day render function for the calendar
  const renderDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const completedHabits = completedHabitsByDate[dateStr] || [];
    const hasCompletions = completedHabits.length > 0;
    
    // Get unique habit Ids to avoid duplicates
    const uniqueHabitIds = [...new Set(completedHabits)];

    return (
      <div className="relative h-full w-full p-2">
        <span className={cn(
          "absolute top-0 left-0 flex h-8 w-8 items-center justify-center",
          hasCompletions && "font-medium"
        )}>
          {format(day, "d")}
        </span>
        {hasCompletions && (
          <div className="mt-8 flex flex-wrap gap-0.5">
            {uniqueHabitIds.slice(0, 5).map((habitId) => {
              const habit = habits?.find(h => h.id === habitId);
              return (
                <div 
                  key={habitId}
                  className={`mt-1 w-2 h-2 rounded-full bg-${habit?.colorTag || 'primary'}`}
                ></div>
              );
            })}
            {uniqueHabitIds.length > 5 && (
              <div className="mt-1 w-2 h-2 rounded-full bg-gray-400"></div>
            )}
          </div>
        )}
      </div>
    );
  };

  const isLoading = habitsLoading || recordsLoading;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Calendar View</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{format(date, "MMMM yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
                components={{
                  day: renderDay
                }}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{format(date, "EEEE, MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              {completedHabitsForSelectedDate.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  No habits completed on this day.
                </p>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-medium">Completed Habits:</h3>
                  <ul className="space-y-2">
                    {completedHabitsForSelectedDate.map((record) => {
                      const habit = habits?.find(h => h.id === record.habitId);
                      return habit ? (
                        <li key={record.id} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${habit.colorTag}`}></div>
                          <span>{habit.name}</span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                {habits?.map((habit) => (
                  <div key={habit.id} className="flex items-center mr-4 mb-2">
                    <div className={`w-3 h-3 rounded-full bg-${habit.colorTag} mr-1`}></div>
                    <span className="text-xs text-gray-500">{habit.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
