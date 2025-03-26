import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHabits } from "@/hooks/use-habits";
import { useHabitRecords } from "@/hooks/use-habits";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2 } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, subMonths } from "date-fns";

export default function Statistics() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const { habits, isLoading: habitsLoading } = useHabits();
  const { habitRecords, isLoading: recordsLoading } = useHabitRecords();

  const isLoading = habitsLoading || recordsLoading;

  // Helper function to calculate completion rate
  const calculateCompletionRate = (habitId: number, startDate: Date, endDate: Date) => {
    const relevantRecords = habitRecords?.filter(
      record => 
        record.habitId === habitId &&
        new Date(record.date) >= startDate &&
        new Date(record.date) <= endDate
    ) || [];

    if (relevantRecords.length === 0) return 0;
    
    const completedCount = relevantRecords.filter(record => record.completed).length;
    return (completedCount / relevantRecords.length) * 100;
  };

  // Prepare data for weekly completion chart
  const prepareWeeklyData = () => {
    const today = new Date();
    const startDate = startOfWeek(today);
    const endDate = today;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dateStr = format(day, "EEE");
      const dayRecords = habitRecords?.filter(
        record => format(new Date(record.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ) || [];
      
      const totalHabits = dayRecords.length;
      const completedHabits = dayRecords.filter(record => record.completed).length;
      const completionRate = totalHabits ? (completedHabits / totalHabits) * 100 : 0;
      
      return {
        name: dateStr,
        completionRate: Math.round(completionRate)
      };
    });
  };

  // Prepare data for trend chart
  const prepareTrendData = () => {
    const today = new Date();
    let startDate;
    let dateFormat;
    let numPoints;
    
    if (timeframe === 'week') {
      startDate = subDays(today, 7);
      dateFormat = "EEE";
      numPoints = 7;
    } else if (timeframe === 'month') {
      startDate = subDays(today, 30);
      dateFormat = "dd/MM";
      numPoints = 10; // Show every 3 days
    } else {
      startDate = subMonths(today, 12);
      dateFormat = "MMM";
      numPoints = 12;
    }
    
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    // For month and year, reduce the number of points
    let filteredDays = days;
    if (timeframe === 'month') {
      filteredDays = days.filter((_, index) => index % 3 === 0);
    } else if (timeframe === 'year') {
      // One point per month
      filteredDays = Array.from({ length: 12 }, (_, i) => subMonths(today, 11 - i));
    }
    
    return filteredDays.map(day => {
      const dateStr = format(day, dateFormat);
      
      // Get completion rate for each day
      const dayRecords = habitRecords?.filter(
        record => format(new Date(record.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ) || [];
      
      const totalHabits = dayRecords.length;
      const completedHabits = dayRecords.filter(record => record.completed).length;
      const completionRate = totalHabits ? (completedHabits / totalHabits) * 100 : 0;
      
      return {
        date: dateStr,
        rate: Math.round(completionRate)
      };
    });
  };

  // Prepare data for habit performance chart
  const prepareHabitPerformanceData = () => {
    const today = new Date();
    let startDate;
    
    if (timeframe === 'week') {
      startDate = subWeeks(today, 1);
    } else if (timeframe === 'month') {
      startDate = subMonths(today, 1);
    } else {
      startDate = subMonths(today, 12);
    }
    
    return habits?.map(habit => {
      const completionRate = calculateCompletionRate(habit.id, startDate, today);
      
      return {
        name: habit.name,
        rate: Math.round(completionRate),
        color: getColorForTag(habit.colorTag)
      };
    }) || [];
  };

  const getColorForTag = (colorTag: string) => {
    switch (colorTag) {
      case 'primary': return '#4F46E5';
      case 'secondary': return '#10B981';
      case 'accent': return '#F59E0B';
      case 'danger': return '#DC2626';
      case 'purple': return '#8B5CF6';
      case 'pink': return '#EC4899';
      default: return '#6B7280';
    }
  };

  const weeklyData = prepareWeeklyData();
  const trendData = prepareTrendData();
  const habitPerformanceData = prepareHabitPerformanceData();

  // Calculate overall completion rate
  const calculateOverallCompletionRate = () => {
    if (!habitRecords || habitRecords.length === 0) return 0;
    
    const completedCount = habitRecords.filter(record => record.completed).length;
    return Math.round((completedCount / habitRecords.length) * 100);
  };

  // Find the longest streak
  const calculateLongestStreak = () => {
    if (!habits || !habitRecords) return 0;
    
    let longestStreak = 0;
    
    habits.forEach(habit => {
      // Get all records for this habit, sorted by date
      const habitData = habitRecords
        .filter(record => record.habitId === habit.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let currentStreak = 0;
      let maxStreak = 0;
      
      habitData.forEach(record => {
        if (record.completed) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      
      longestStreak = Math.max(longestStreak, maxStreak);
    });
    
    return longestStreak;
  };

  const overallCompletionRate = calculateOverallCompletionRate();
  const longestStreak = calculateLongestStreak();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold">{overallCompletionRate}%</p>
                <p className="text-sm text-gray-500">All habits combined</p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-gray-200 rounded">
              <div className="h-2 bg-green-500 rounded" style={{ width: `${overallCompletionRate}%` }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path>
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold">{longestStreak} days</p>
                <p className="text-sm text-gray-500">Your best performance</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-1">
              {Array.from({ length: Math.min(longestStreak, 20) }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-500"></div>
              ))}
              {longestStreak > 20 && (
                <div className="text-xs text-gray-500 ml-1">+{longestStreak - 20} more</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                  <Bar dataKey="completionRate" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Completion Trend</CardTitle>
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                  <Line type="monotone" dataKey="rate" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Habits Performance</CardTitle>
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habitPerformanceData.map((habit) => (
                <div key={habit.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{habit.name}</span>
                    <span className="text-sm font-medium text-gray-900">{habit.rate}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div 
                      className="h-2 rounded" 
                      style={{ width: `${habit.rate}%`, backgroundColor: habit.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
