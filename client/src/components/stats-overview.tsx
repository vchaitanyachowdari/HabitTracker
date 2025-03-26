import { useHabits } from "@/hooks/use-habits";
import { useHabitRecords } from "@/hooks/use-habits";
import { Check, Flame, Package } from "lucide-react";

export default function StatsOverview() {
  const { habits } = useHabits();
  const { habitRecords } = useHabitRecords();
  
  const calculateCompletionRate = () => {
    if (!habitRecords || habitRecords.length === 0) return 0;
    
    const completedCount = habitRecords.filter(record => record.completed).length;
    return Math.round((completedCount / habitRecords.length) * 100);
  };

  const calculateCurrentStreak = () => {
    if (!habitRecords) return 0;
    
    const today = new Date();
    const sortedRecords = [...habitRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Group records by date
    const recordsByDate = sortedRecords.reduce((acc, record) => {
      const dateStr = new Date(record.date).toDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(record);
      return acc;
    }, {} as Record<string, typeof habitRecords>);
    
    // Check consecutive days
    let streak = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);
    
    while (true) {
      const dateStr = currentDate.toDateString();
      const dayRecords = recordsByDate[dateStr];
      
      // If we have no records for this day or not all completed, break the streak
      if (!dayRecords || !dayRecords.every(r => r.completed)) {
        break;
      }
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const completionRate = calculateCompletionRate();
  const currentStreak = calculateCurrentStreak();
  const totalHabits = habits?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4 h-1 w-full bg-gray-200 rounded">
          <div className="h-1 bg-green-500 rounded" style={{ width: `${completionRate}%` }}></div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Streak</p>
            <p className="text-2xl font-bold text-gray-900">{currentStreak} days</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-4 flex space-x-1">
          {Array.from({ length: Math.min(currentStreak, 14) }).map((_, i) => (
            <div key={i} className="habit-streak-dot bg-amber-500"></div>
          ))}
          {currentStreak > 14 && (
            <span className="text-xs text-gray-500 ml-1">+{currentStreak - 14}</span>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Habits</p>
            <p className="text-2xl font-bold text-gray-900">{totalHabits} habits</p>
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-1">
          {habits?.slice(0, 8).map((habit, index) => (
            <div 
              key={habit.id} 
              className={`h-2 rounded bg-${habit.colorTag}`}
            ></div>
          ))}
          {Array.from({ length: Math.max(0, 8 - (habits?.length || 0)) }).map((_, i) => (
            <div key={`empty-${i}`} className="h-2 rounded bg-gray-300"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
