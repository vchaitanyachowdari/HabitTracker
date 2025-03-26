import { useHabits } from "@/hooks/use-habits";
import { useHabitRecords } from "@/hooks/use-habits";
import { Loader2 } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";

export default function ProgressCharts() {
  const { habits, isLoading: habitsLoading } = useHabits();
  const { habitRecords, isLoading: recordsLoading } = useHabitRecords();

  // Get weekly completion data
  const getWeeklyCompletionData = () => {
    if (!habitRecords) return Array(7).fill(0);
    
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday as week start
    
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      return addDays(startOfCurrentWeek, i);
    });
    
    return weekDays.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayRecords = habitRecords.filter(
        record => format(new Date(record.date), "yyyy-MM-dd") === dateStr
      );
      
      if (dayRecords.length === 0) return 0;
      
      const completedCount = dayRecords.filter(record => record.completed).length;
      return Math.round((completedCount / dayRecords.length) * 100);
    });
  };

  // Get performance data for each habit
  const getHabitPerformanceData = () => {
    if (!habits || !habitRecords) return [];
    
    return habits.map(habit => {
      const habitData = habitRecords.filter(record => record.habitId === habit.id);
      
      if (habitData.length === 0) return { name: habit.name, rate: 0, colorTag: habit.colorTag };
      
      const completedCount = habitData.filter(record => record.completed).length;
      const rate = Math.round((completedCount / habitData.length) * 100);
      
      return {
        name: habit.name,
        rate,
        colorTag: habit.colorTag
      };
    });
  };

  const weeklyData = getWeeklyCompletionData();
  const performanceData = getHabitPerformanceData();
  const isLoading = habitsLoading || recordsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Completion</h3>
        <div className="h-64 flex items-end space-x-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t" style={{ height: '100%' }}>
                <div 
                  className="bg-primary rounded-t h-full" 
                  style={{ height: `${weeklyData[index]}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">{day}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Habits Performance</h3>
        <div className="space-y-4">
          {performanceData.map((habit) => (
            <div key={habit.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">{habit.name}</span>
                <span className="text-sm font-medium text-gray-900">{habit.rate}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div 
                  className={`h-2 bg-${habit.colorTag} rounded`} 
                  style={{ width: `${habit.rate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
