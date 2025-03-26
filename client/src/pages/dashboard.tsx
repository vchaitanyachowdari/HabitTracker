import { useState } from "react";
import StatsOverview from "@/components/stats-overview";
import TodaysHabits from "@/components/todays-habits";
import CalendarView from "@/components/calendar-view";
import ProgressCharts from "@/components/progress-charts";
import AddHabitModal from "@/components/add-habit-modal";
import { formatDate } from "@/lib/date-utils";

export default function Dashboard() {
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const today = new Date();
  const formattedDate = formatDate(today);

  return (
    <>
      {/* Dashboard Header - Mobile only */}
      <div className="md:hidden mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">{formattedDate}</p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Today's Habits Section */}
      <TodaysHabits
        onAddHabitClick={() => setIsAddHabitModalOpen(true)}
      />

      {/* Calendar View */}
      <CalendarView />

      {/* Progress Charts */}
      <ProgressCharts />

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
      />
    </>
  );
}
