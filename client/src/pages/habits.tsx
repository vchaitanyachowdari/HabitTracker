import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/use-habits";
import { Habit } from "@shared/schema";
import { PlusIcon, Loader2 } from "lucide-react";
import AddHabitModal from "@/components/add-habit-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";

export default function Habits() {
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const { habits, isLoading, refetch } = useHabits();
  const { toast } = useToast();
  const [deletingHabitId, setDeletingHabitId] = useState<number | null>(null);

  const handleDeleteHabit = async (habitId: number) => {
    try {
      setDeletingHabitId(habitId);
      await apiRequest("DELETE", `/api/habits/${habitId}`);
      toast({
        title: "Habit deleted",
        description: "The habit has been successfully deleted.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the habit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingHabitId(null);
    }
  };

  const getHabitsByFrequency = (frequency: string) => {
    return habits?.filter((habit) => habit.frequency === frequency) || [];
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Habits</h1>
        <Button onClick={() => setIsAddHabitModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : habits?.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first habit to start tracking your progress.
              </p>
              <Button onClick={() => setIsAddHabitModalOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Habit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits?.map((habit) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onDelete={handleDeleteHabit}
                  isDeleting={deletingHabitId === habit.id}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getHabitsByFrequency("daily").map((habit) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onDelete={handleDeleteHabit}
                  isDeleting={deletingHabitId === habit.id}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getHabitsByFrequency("weekly").map((habit) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onDelete={handleDeleteHabit}
                  isDeleting={deletingHabitId === habit.id}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getHabitsByFrequency("monthly").map((habit) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onDelete={handleDeleteHabit}
                  isDeleting={deletingHabitId === habit.id}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
      />
    </div>
  );
}

interface HabitCardProps {
  habit: Habit;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

function HabitCard({ habit, onDelete, isDeleting }: HabitCardProps) {
  return (
    <Card className="overflow-hidden relative">
      <div className={`absolute top-0 left-0 w-1 h-full bg-${habit.colorTag}`}></div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{habit.name}</h4>
            <p className="text-sm text-gray-500">
              {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
              {habit.reminderTime ? ` • ${habit.reminderTime}` : ''}
            </p>
            {habit.description && (
              <p className="mt-2 text-sm text-gray-600">{habit.description}</p>
            )}
          </div>
          <div>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={() => onDelete(habit.id)}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
