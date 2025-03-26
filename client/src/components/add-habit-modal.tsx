import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HabitColor, habitColors, HabitFrequency, habitFrequencies, insertHabitSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const [selectedFrequency, setSelectedFrequency] = useState<HabitFrequency>("daily");
  const [selectedColor, setSelectedColor] = useState<HabitColor>("secondary");
  const { toast } = useToast();
  
  // Extended schema with validation
  const formSchema = insertHabitSchema.extend({
    name: z.string().min(1, "Habit name is required").max(50, "Habit name is too long"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "daily" as HabitFrequency,
      reminderTime: "",
      colorTag: "secondary" as HabitColor,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await apiRequest("POST", "/api/habits", {
        ...data,
        frequency: selectedFrequency,
        colorTag: selectedColor,
      });
      
      toast({
        title: "Habit created",
        description: "Your new habit has been created successfully.",
      });
      
      // Reset form and close modal
      form.reset();
      onClose();
      
      // Refresh habits data
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Color mapping
  const colorNames: Record<HabitColor, string> = {
    primary: "Indigo",
    secondary: "Green",
    accent: "Amber",
    danger: "Red",
    purple: "Purple",
    pink: "Pink",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Morning Run" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional details..." 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Label>Frequency</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {habitFrequencies.map((frequency) => (
                  <Button
                    key={frequency}
                    type="button"
                    variant={selectedFrequency === frequency ? "default" : "outline"}
                    onClick={() => {
                      setSelectedFrequency(frequency);
                      form.setValue("frequency", frequency);
                    }}
                  >
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Time (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Label>Color Tag</Label>
              <div className="mt-2 flex space-x-2">
                {habitColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full bg-${color} border-2 ${
                      selectedColor === color 
                        ? `border-${color} ring-2 ring-white` 
                        : "border-white"
                    }`}
                    onClick={() => {
                      setSelectedColor(color);
                      form.setValue("colorTag", color);
                    }}
                    aria-label={`${colorNames[color]} color`}
                  ></button>
                ))}
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Habit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
