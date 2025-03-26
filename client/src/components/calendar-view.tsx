import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { useHabitRecords } from "@/hooks/use-habits";
import { 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday, getDay } from "date-fns";
import { cn } from "@/lib/utils";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { habits, isLoading: habitsLoading } = useHabits();
  const { habitRecords, isLoading: recordsLoading } = useHabitRecords();

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Generate days of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate days from previous month to fill the first week
  const startDay = getDay(monthStart);
  
  // Get all completed habits by date
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

  // Get habits for a specific date
  const getHabitsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return completedHabitsByDate[dateStr] || [];
  };

  const isLoading = habitsLoading || recordsLoading;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex space-x-2">
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            <div className="text-center text-xs font-medium text-gray-500">Sun</div>
            <div className="text-center text-xs font-medium text-gray-500">Mon</div>
            <div className="text-center text-xs font-medium text-gray-500">Tue</div>
            <div className="text-center text-xs font-medium text-gray-500">Wed</div>
            <div className="text-center text-xs font-medium text-gray-500">Thu</div>
            <div className="text-center text-xs font-medium text-gray-500">Fri</div>
            <div className="text-center text-xs font-medium text-gray-500">Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days from previous month */}
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-prev-${index}`} className="h-24 p-1 border border-gray-200 bg-gray-100 text-gray-400"></div>
            ))}
            
            {/* Current month days */}
            {monthDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const completedHabits = getHabitsForDate(day);
              const isCurrentDay = isToday(day);
              
              return (
                <div 
                  key={dateStr}
                  className={cn(
                    "h-24 p-1 border border-gray-200",
                    isCurrentDay && "bg-blue-50 ring-2 ring-primary"
                  )}
                >
                  <span className={cn(
                    "text-xs",
                    isCurrentDay && "font-medium"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 flex flex-wrap">
                    {completedHabits.map((habitId) => {
                      const habit = habits?.find(h => h.id === habitId);
                      return habit ? (
                        <div 
                          key={`${dateStr}-${habitId}`}
                          className={`mt-1 ml-1 w-2 h-2 rounded-full bg-${habit.colorTag}`}
                        ></div>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex flex-wrap items-center">
            {habits?.map((habit) => (
              <div key={habit.id} className="flex items-center mr-4 mb-2">
                <div className={`w-3 h-3 rounded-full bg-${habit.colorTag} mr-1`}></div>
                <span className="text-xs text-gray-500">{habit.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
