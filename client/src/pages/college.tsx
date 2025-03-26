import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CollegeClass, ClassAttendance, InsertClassAttendance, CollegeDay } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Bookmark, User, Clock, MapPin, BarChart4, PlusCircle, School } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Type for the form to create or edit a class
interface ClassFormData {
  name: string;
  courseCode: string;
  instructor: string;
  dayOfWeek: CollegeDay;
  startTime: string;
  endTime: string;
  location: string;
  colorTag: string;
}

export default function College() {
  const { toast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendanceNote, setAttendanceNote] = useState("");
  const [attended, setAttended] = useState(true);
  const [classFormData, setClassFormData] = useState<ClassFormData>({
    name: "",
    courseCode: "",
    instructor: "",
    dayOfWeek: "monday",
    startTime: "09:00",
    endTime: "10:30",
    location: "",
    colorTag: "primary",
  });

  // Fetch all college classes
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['/api/college/classes'],
    queryFn: () => apiRequest<CollegeClass[]>('/api/college/classes'),
  });

  // Fetch all attendance records
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['/api/college/attendance'],
    queryFn: () => apiRequest<ClassAttendance[]>('/api/college/attendance'),
  });

  // Fetch attendance statistics
  const { data: attendanceStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/college/attendance/stats'],
    queryFn: () => apiRequest<{ attended: number, skipped: number, total: number }>('/api/college/attendance/stats'),
  });

  // Create a new college class
  const createClassMutation = useMutation({
    mutationFn: (classData: ClassFormData) => 
      apiRequest('/api/college/classes', { method: 'POST', body: JSON.stringify(classData) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college/classes'] });
      resetClassForm();
      setIsCreateDialogOpen(false);
      toast({
        title: "Class Created",
        description: "The class has been added to your schedule.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating class:", error);
    }
  });

  // Record class attendance
  const recordAttendanceMutation = useMutation({
    mutationFn: (attendance: InsertClassAttendance) => 
      apiRequest('/api/college/attendance', { method: 'POST', body: JSON.stringify(attendance) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/college/attendance/stats'] });
      setIsAttendanceDialogOpen(false);
      toast({
        title: "Attendance Recorded",
        description: attended ? "Class marked as attended." : "Class marked as skipped.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        variant: "destructive",
      });
      console.error("Error recording attendance:", error);
    }
  });

  // Handler for creating a new class
  const handleCreateClass = () => {
    createClassMutation.mutate(classFormData);
  };

  // Handler for recording attendance
  const handleRecordAttendance = () => {
    if (!selectedClassId || !selectedDate) return;

    const attendanceData: InsertClassAttendance = {
      classId: selectedClassId,
      date: selectedDate,
      attended: attended,
      notes: attendanceNote || null,
    };

    recordAttendanceMutation.mutate(attendanceData);
  };

  // Reset the class form
  const resetClassForm = () => {
    setClassFormData({
      name: "",
      courseCode: "",
      instructor: "",
      dayOfWeek: "monday",
      startTime: "09:00",
      endTime: "10:30",
      location: "",
      colorTag: "primary",
    });
  };

  // Format day names for display
  const formatDay = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Get attendance for a specific class
  const getClassAttendance = (classId: number) => {
    return attendanceRecords.filter(record => record.classId === classId);
  };

  // Get attendance statistics for a specific class
  const getClassStats = (classId: number) => {
    const records = getClassAttendance(classId);
    const attended = records.filter(record => record.attended).length;
    const skipped = records.filter(record => !record.attended).length;

    return {
      attended,
      skipped,
      total: attended + skipped,
      attendanceRate: records.length > 0 ? (attended / records.length) * 100 : 0
    };
  };

  // Color mapping for class attendance rates
  const getAttendanceColor = (rate: number): string => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 75) return "bg-lime-500";
    if (rate >= 60) return "bg-amber-500";
    if (rate >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Color mapping for class color tags
  const getColorClass = (colorTag: string): string => {
    switch (colorTag) {
      case "primary": return "bg-primary text-primary-foreground";
      case "secondary": return "bg-secondary text-secondary-foreground";
      case "accent": return "bg-accent text-accent-foreground";
      case "danger": return "bg-red-500 text-white";
      case "purple": return "bg-purple-500 text-white";
      case "pink": return "bg-pink-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  // Opens attendance dialog for a class
  const openAttendanceDialog = (classId: number) => {
    setSelectedClassId(classId);
    setSelectedDate(new Date());
    setAttended(true);
    setAttendanceNote("");
    setIsAttendanceDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">College Classes</h1>
          <p className="text-muted-foreground">Track your class schedule and attendance</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6 mt-6">
          {isLoadingClasses ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <School className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Classes Added</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your college classes to track attendance and get statistics.
                </p>
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Your First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((collegeClass) => (
                <Card key={collegeClass.id}>
                  <CardHeader className={cn("text-white", getColorClass(collegeClass.colorTag))}>
                    <CardTitle className="flex justify-between items-start">
                      <span>{collegeClass.name}</span>
                      <Badge variant="outline" className="border-white text-white">
                        {collegeClass.courseCode}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-white/80 flex items-center">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {formatDay(collegeClass.dayOfWeek)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center text-sm">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{collegeClass.instructor || "No instructor"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{collegeClass.startTime} - {collegeClass.endTime}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{collegeClass.location || "No location"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Bookmark className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        Attendance: {getClassStats(collegeClass.id).attended}/{getClassStats(collegeClass.id).total} classes
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => openAttendanceDialog(collegeClass.id)}
                    >
                      Record Attendance
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Your overall class attendance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : attendanceStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-2xl">
                          {attendanceStats.attended}
                        </CardTitle>
                        <CardDescription>Classes Attended</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-2xl">
                          {attendanceStats.skipped}
                        </CardTitle>
                        <CardDescription>Classes Skipped</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-2xl">
                          {attendanceStats.total > 0 
                            ? `${Math.round((attendanceStats.attended / attendanceStats.total) * 100)}%` 
                            : "N/A"}
                        </CardTitle>
                        <CardDescription>Attendance Rate</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Class Breakdown</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead className="text-right">Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map((collegeClass) => {
                          const stats = getClassStats(collegeClass.id);
                          return (
                            <TableRow key={collegeClass.id}>
                              <TableCell className="font-medium">
                                {collegeClass.name}
                              </TableCell>
                              <TableCell>{collegeClass.courseCode}</TableCell>
                              <TableCell>{formatDay(collegeClass.dayOfWeek)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end">
                                  <div className="w-12 mr-2">
                                    {stats.total > 0 
                                      ? `${Math.round(stats.attendanceRate)}%` 
                                      : "N/A"}
                                  </div>
                                  {stats.total > 0 && (
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={cn("h-full", getAttendanceColor(stats.attendanceRate))}
                                        style={{ width: `${Math.round(stats.attendanceRate)}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <p>No attendance data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Class Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add a New Class</DialogTitle>
            <DialogDescription>
              Enter the details of your college class below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Class Name
              </Label>
              <Input
                id="name"
                placeholder="Introduction to Programming"
                className="col-span-3"
                value={classFormData.name}
                onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseCode" className="text-right">
                Course Code
              </Label>
              <Input
                id="courseCode"
                placeholder="CS101"
                className="col-span-3"
                value={classFormData.courseCode}
                onChange={(e) => setClassFormData({ ...classFormData, courseCode: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructor" className="text-right">
                Instructor
              </Label>
              <Input
                id="instructor"
                placeholder="Dr. Smith"
                className="col-span-3"
                value={classFormData.instructor}
                onChange={(e) => setClassFormData({ ...classFormData, instructor: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dayOfWeek" className="text-right">
                Day of Week
              </Label>
              <Select 
                value={classFormData.dayOfWeek} 
                onValueChange={(value) => setClassFormData({ ...classFormData, dayOfWeek: value as CollegeDay })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                className="col-span-3"
                value={classFormData.startTime}
                onChange={(e) => setClassFormData({ ...classFormData, startTime: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                className="col-span-3"
                value={classFormData.endTime}
                onChange={(e) => setClassFormData({ ...classFormData, endTime: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Building A, Room 101"
                className="col-span-3"
                value={classFormData.location}
                onChange={(e) => setClassFormData({ ...classFormData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="colorTag" className="text-right">
                Color
              </Label>
              <Select 
                value={classFormData.colorTag} 
                onValueChange={(value) => setClassFormData({ ...classFormData, colorTag: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Blue</SelectItem>
                  <SelectItem value="secondary">Green</SelectItem>
                  <SelectItem value="accent">Teal</SelectItem>
                  <SelectItem value="danger">Red</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClass} disabled={createClassMutation.isPending}>
              {createClassMutation.isPending ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Class Attendance</DialogTitle>
            <DialogDescription>
              Mark your attendance for this class
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendance-date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attended" className="text-right">
                Attended
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch 
                  id="attended" 
                  checked={attended} 
                  onCheckedChange={setAttended} 
                />
                <Label htmlFor="attended">
                  {attended ? "Present" : "Absent"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                placeholder={attended ? "Any notes?" : "Reason for absence"}
                className="col-span-3"
                value={attendanceNote}
                onChange={(e) => setAttendanceNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecordAttendance} 
              disabled={recordAttendanceMutation.isPending || !selectedDate}
            >
              {recordAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}