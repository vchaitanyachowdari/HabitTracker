import { 
  habits, type Habit, type InsertHabit, 
  habitRecords, type HabitRecord, type InsertHabitRecord, 
  users, type User, type InsertUser,
  collegeClasses, type CollegeClass, type InsertCollegeClass,
  classAttendance, type ClassAttendance, type InsertClassAttendance,
  type NotificationSettings,
  habitCategories, type HabitCategory, type InsertHabitCategory,
  habitTags, type HabitTag, type InsertHabitTag,
  meetings, type Meeting, type InsertMeeting,
  meetingParticipants, type MeetingParticipant, type InsertMeetingParticipant,
  meetingTemplates, type MeetingTemplate, type InsertMeetingTemplate,
  type MeetingPlatform, type MeetingType, type MeetingStatus,
  defaultHabitCategories
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User notification settings
  getNotificationSettings(userId: number): Promise<NotificationSettings | undefined>;
  updateNotificationSettings(userId: number, settings: NotificationSettings): Promise<NotificationSettings | undefined>;
  
  // Habit Categories operations
  getHabitCategories(): Promise<HabitCategory[]>;
  getHabitCategory(id: number): Promise<HabitCategory | undefined>;
  createHabitCategory(category: InsertHabitCategory): Promise<HabitCategory>;
  updateHabitCategory(id: number, category: Partial<InsertHabitCategory>): Promise<HabitCategory | undefined>;
  deleteHabitCategory(id: number): Promise<boolean>;
  
  // Habit Tags operations
  getHabitTags(): Promise<HabitTag[]>;
  getHabitTag(id: number): Promise<HabitTag | undefined>;
  createHabitTag(tag: InsertHabitTag): Promise<HabitTag>;
  updateHabitTag(id: number, tag: Partial<InsertHabitTag>): Promise<HabitTag | undefined>;
  deleteHabitTag(id: number): Promise<boolean>;
  
  // Habit CRUD operations
  getHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  getHabitsByCategory(categoryId: number): Promise<Habit[]>;
  getHabitsByTag(tagId: string): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit Record operations
  getHabitRecords(habitId?: number, startDate?: Date, endDate?: Date): Promise<HabitRecord[]>;
  getHabitRecord(habitId: number, date: Date): Promise<HabitRecord | undefined>;
  createHabitRecord(record: InsertHabitRecord): Promise<HabitRecord>;
  updateHabitRecord(id: number, record: Partial<InsertHabitRecord>): Promise<HabitRecord | undefined>;
  
  // College Class CRUD operations
  getCollegeClasses(): Promise<CollegeClass[]>;
  getCollegeClass(id: number): Promise<CollegeClass | undefined>;
  createCollegeClass(collegeClass: InsertCollegeClass): Promise<CollegeClass>;
  updateCollegeClass(id: number, collegeClass: Partial<InsertCollegeClass>): Promise<CollegeClass | undefined>;
  deleteCollegeClass(id: number): Promise<boolean>;
  
  // Class Attendance operations
  getClassAttendanceRecords(classId?: number, startDate?: Date, endDate?: Date): Promise<ClassAttendance[]>;
  getClassAttendance(classId: number, date: Date): Promise<ClassAttendance | undefined>;
  createClassAttendance(record: InsertClassAttendance): Promise<ClassAttendance>;
  updateClassAttendance(id: number, record: Partial<InsertClassAttendance>): Promise<ClassAttendance | undefined>;
  
  // College statistics
  getAttendanceStats(): Promise<{ attended: number, skipped: number, total: number }>;
  
  // Meeting operations
  getMeetings(userId?: number, startDate?: Date, endDate?: Date): Promise<Meeting[]>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingsByPlatform(platform: MeetingPlatform): Promise<Meeting[]>;
  getMeetingsByType(meetingType: MeetingType): Promise<Meeting[]>;
  getMeetingsByStatus(status: MeetingStatus): Promise<Meeting[]>;
  getMeetingsByRelatedHabit(habitId: number): Promise<Meeting[]>;
  getMeetingsByRelatedClass(classId: number): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;
  
  // Meeting participants
  getMeetingParticipants(meetingId: number): Promise<MeetingParticipant[]>;
  getMeetingParticipant(id: number): Promise<MeetingParticipant | undefined>;
  addMeetingParticipant(participant: InsertMeetingParticipant): Promise<MeetingParticipant>;
  updateMeetingParticipant(id: number, participant: Partial<InsertMeetingParticipant>): Promise<MeetingParticipant | undefined>;
  removeMeetingParticipant(id: number): Promise<boolean>;
  
  // Meeting templates
  getMeetingTemplates(userId: number): Promise<MeetingTemplate[]>;
  getMeetingTemplate(id: number): Promise<MeetingTemplate | undefined>;
  createMeetingTemplate(template: InsertMeetingTemplate): Promise<MeetingTemplate>;
  updateMeetingTemplate(id: number, template: Partial<InsertMeetingTemplate>): Promise<MeetingTemplate | undefined>;
  deleteMeetingTemplate(id: number): Promise<boolean>;
  createMeetingFromTemplate(templateId: number, startTime: Date, additionalData?: Partial<InsertMeeting>): Promise<Meeting>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private habitRecords: Map<number, HabitRecord>;
  private habitCategories: Map<number, HabitCategory>;
  private habitTags: Map<number, HabitTag>;
  private collegeClasses: Map<number, CollegeClass>;
  private classAttendances: Map<number, ClassAttendance>;
  private meetings: Map<number, Meeting>;
  private meetingParticipants: Map<number, MeetingParticipant>;
  private meetingTemplates: Map<number, MeetingTemplate>;
  private userId: number;
  private habitId: number;
  private recordId: number;
  private categoryId: number;
  private tagId: number;
  private collegeClassId: number;
  private classAttendanceId: number;
  private meetingId: number;
  private meetingParticipantId: number;
  private meetingTemplateId: number;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitRecords = new Map();
    this.habitCategories = new Map();
    this.habitTags = new Map();
    this.collegeClasses = new Map();
    this.classAttendances = new Map();
    this.meetings = new Map();
    this.meetingParticipants = new Map();
    this.meetingTemplates = new Map();
    this.userId = 1;
    this.habitId = 1;
    this.recordId = 1;
    this.categoryId = 1;
    this.tagId = 1;
    this.collegeClassId = 1;
    this.classAttendanceId = 1;
    this.meetingId = 1;
    this.meetingParticipantId = 1;
    this.meetingTemplateId = 1;

    // Add some initial habits for demonstration
    // We need to use Promise.resolve because we can't make the constructor async
    Promise.resolve().then(() => this.initializeData());
  }

  private async initializeData() {
    // Initialize default habit categories from schema
    for (const categoryName of defaultHabitCategories) {
      let colorTag: "primary" | "secondary" | "accent" | "danger" | "purple" | "pink" = "primary";
      
      // Assign different colors based on category name
      switch(categoryName) {
        case "Health & Fitness":
          colorTag = "secondary";
          break;
        case "Learning & Education":
          colorTag = "primary";
          break;
        case "Personal Development":
          colorTag = "accent";
          break;
        case "Productivity":
          colorTag = "danger";
          break;
        case "Mindfulness":
          colorTag = "purple";
          break;
        default:
          colorTag = "primary";
      }
      
      await this.createHabitCategory({
        name: categoryName,
        description: `Habits related to ${categoryName.toLowerCase()}`,
        colorTag
      });
    }
    
    // Create some example tags
    const exampleTags = [
      { name: "Morning", colorTag: "primary" },
      { name: "Evening", colorTag: "purple" },
      { name: "Quick", colorTag: "secondary" },
      { name: "Important", colorTag: "danger" },
      { name: "Challenging", colorTag: "accent" }
    ];
    
    for (const tag of exampleTags) {
      await this.createHabitTag(tag);
    }
    
    // Fetch all created categories
    const categories = await this.getHabitCategories();
    const tags = await this.getHabitTags();
    
    // Map categories by name for easier lookup
    const categoryMap = new Map(categories.map(category => [category.name, category.id]));
    const tagMap = new Map(tags.map(tag => [tag.name, tag.id]));

    // Creating example habits with categories and tags
    const exampleHabits: (InsertHabit & { categoryId?: number, tagIds?: number[] })[] = [
      { 
        name: "Morning Workout", 
        description: "30 min workout routine", 
        frequency: "daily", 
        reminderTime: "07:00", 
        colorTag: "secondary",
        categoryId: categoryMap.get("Health & Fitness"),
        tagIds: [tagMap.get("Morning"), tagMap.get("Important")]
      },
      { 
        name: "Read 30 Minutes", 
        description: "Read a book", 
        frequency: "daily", 
        reminderTime: "19:00", 
        colorTag: "primary",
        categoryId: categoryMap.get("Learning & Education"),
        tagIds: [tagMap.get("Evening")]
      },
      { 
        name: "Meditate", 
        description: "10 min meditation", 
        frequency: "daily", 
        reminderTime: "08:00", 
        colorTag: "accent",
        categoryId: categoryMap.get("Mindfulness"),
        tagIds: [tagMap.get("Morning"), tagMap.get("Quick")]
      },
      { 
        name: "No Social Media", 
        description: "Avoid social platforms", 
        frequency: "daily", 
        reminderTime: null, 
        colorTag: "danger",
        categoryId: categoryMap.get("Personal Development"),
        tagIds: [tagMap.get("Challenging")]
      },
      { 
        name: "Drink 2L Water", 
        description: "Stay hydrated", 
        frequency: "daily", 
        reminderTime: null, 
        colorTag: "primary",
        categoryId: categoryMap.get("Health & Fitness")
      },
    ];

    // Create all habits first
    const createdHabits: Habit[] = [];
    for (const habit of exampleHabits) {
      const createdHabit = await this.createHabit(habit);
      createdHabits.push(createdHabit);
    }
    
    // Create some example records for the past few days
    const today = new Date();
    
    // Use the created habits array
    for (const habit of createdHabits) {
      // Create records for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Random completion status, with higher chance of completion for older habits
        const completed = Math.random() > 0.3; // 70% chance of completion
        
        await this.createHabitRecord({
          habitId: habit.id,
          date: date,
          completed: completed
        });
      }
    }
    
    // Creating example college classes
    const exampleClasses: InsertCollegeClass[] = [
      { 
        name: "Introduction to Computer Science", 
        courseCode: "CS101", 
        instructor: "Dr. Smith",
        dayOfWeek: "monday", 
        startTime: "09:00", 
        endTime: "10:30", 
        location: "Building A, Room 101",
        colorTag: "primary" 
      },
      { 
        name: "Calculus I", 
        courseCode: "MATH201", 
        instructor: "Dr. Johnson",
        dayOfWeek: "tuesday", 
        startTime: "11:00", 
        endTime: "12:30", 
        location: "Building B, Room 203",
        colorTag: "secondary" 
      },
      { 
        name: "Introduction to Psychology", 
        courseCode: "PSY101", 
        instructor: "Dr. Williams",
        dayOfWeek: "wednesday", 
        startTime: "14:00", 
        endTime: "15:30", 
        location: "Building C, Room 305",
        colorTag: "accent" 
      },
      { 
        name: "Physics I", 
        courseCode: "PHYS201", 
        instructor: "Dr. Brown",
        dayOfWeek: "thursday", 
        startTime: "10:00", 
        endTime: "11:30", 
        location: "Science Building, Room 102",
        colorTag: "danger" 
      },
      { 
        name: "English Composition", 
        courseCode: "ENG101", 
        instructor: "Prof. Davis",
        dayOfWeek: "friday", 
        startTime: "13:00", 
        endTime: "14:30", 
        location: "Liberal Arts Building, Room 201",
        colorTag: "purple" 
      }
    ];
    
    // Create college classes
    const createdClasses: CollegeClass[] = [];
    for (const collegeClass of exampleClasses) {
      const createdClass = await this.createCollegeClass(collegeClass);
      createdClasses.push(createdClass);
    }
    
    // Create attendance records for the past 30 days for each class
    // Only create records for class days that match the day of the week
    for (const collegeClass of createdClasses) {
      // Get the day of the week for this class
      const classDayOfWeek = collegeClass.dayOfWeek;
      
      // Create attendance records for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Only create attendance record if day of week matches class day
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (dayOfWeek === classDayOfWeek) {
          // Random attendance status, with higher chance of attendance
          const attended = Math.random() > 0.2; // 80% chance of attendance
          
          await this.createClassAttendance({
            classId: collegeClass.id,
            date: date,
            attended: attended,
            notes: attended ? null : "Missed class"
          });
        }
      }
    }

    // Create a default user for testing
    const defaultUser = await this.createUser({
      username: "user",
      password: "$2a$10$VWXUSwYZ.4dlSLCM84gkTeJLXLMeWXKYT1jl.8BEG3c.RVh.DP8w2", // "password"
      email: "user@example.com",
      name: "Default User",
      notificationSettings: {
        enabled: false,
        phoneNumber: null,
        notifyBeforeClass: false,
        notifyMissedClass: false,
        reminderTime: 30
      }
    });

    // Create example meeting templates
    const exampleTemplates: InsertMeetingTemplate[] = [
      {
        name: "Quick Check-in",
        description: "15-minute check-in meeting",
        platform: "zoom",
        meetingType: "one_on_one",
        duration: 15,
        meetingUrlTemplate: "https://zoom.us/j/{meetingId}",
        colorTag: "primary",
        reminderEnabled: true,
        reminderTime: 5,
        notes: "Standard check-in template",
        userId: defaultUser.id
      },
      {
        name: "Team Standup",
        description: "Daily team standup meeting",
        platform: "google_meet",
        meetingType: "group",
        duration: 30,
        meetingUrlTemplate: "https://meet.google.com/{meetingId}",
        colorTag: "secondary",
        reminderEnabled: true,
        reminderTime: 10,
        notes: "Daily team coordination meeting",
        userId: defaultUser.id
      },
      {
        name: "Workout Session",
        description: "Virtual workout with trainer",
        platform: "zoom",
        meetingType: "workshop",
        duration: 60,
        meetingUrlTemplate: "https://zoom.us/j/{meetingId}",
        colorTag: "accent",
        reminderEnabled: true,
        reminderTime: 15,
        notes: "Have workout clothes ready",
        userId: defaultUser.id
      }
    ];

    // Create meeting templates
    const createdTemplates: MeetingTemplate[] = [];
    for (const template of exampleTemplates) {
      const createdTemplate = await this.createMeetingTemplate(template);
      createdTemplates.push(createdTemplate);
    }

    // Create example meetings
    // Some in the past, some in the future
    const exampleMeetings: InsertMeeting[] = [
      {
        title: "Weekly Study Group",
        description: "Study group for CS101 class",
        platform: "zoom",
        meetingType: "group",
        status: "scheduled",
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
        meetingUrl: "https://zoom.us/j/123456789",
        meetingId: "123456789",
        password: "password123",
        hostUserId: defaultUser.id,
        colorTag: "primary",
        reminderEnabled: true,
        reminderTime: 15,
        notes: "Bring questions about last week's lecture",
        relatedClassId: createdClasses[0].id // Related to CS101
      },
      {
        title: "Workout Session",
        description: "Virtual workout with fitness group",
        platform: "zoom",
        meetingType: "workshop",
        status: "scheduled",
        startTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
        meetingUrl: "https://zoom.us/j/987654321",
        meetingId: "987654321",
        password: null,
        hostUserId: defaultUser.id,
        colorTag: "secondary",
        reminderEnabled: true,
        reminderTime: 10,
        notes: "Focus on strength training",
        relatedHabitId: createdHabits[0].id // Related to Morning Workout
      },
      {
        title: "Meditation Group",
        description: "Group meditation session",
        platform: "google_meet",
        meetingType: "group",
        status: "scheduled",
        startTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 mins later
        meetingUrl: "https://meet.google.com/abc-defg-hij",
        meetingId: "abc-defg-hij",
        password: null,
        hostUserId: defaultUser.id,
        colorTag: "accent",
        reminderEnabled: true,
        reminderTime: 15,
        notes: "Beginners welcome",
        relatedHabitId: createdHabits[2].id // Related to Meditate habit
      },
      {
        title: "Study Session",
        description: "Preparation for midterm exam",
        platform: "zoom",
        meetingType: "group",
        status: "completed",
        startTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000), // 2 hours later
        meetingUrl: "https://zoom.us/j/111222333",
        meetingId: "111222333",
        password: "study123",
        hostUserId: defaultUser.id,
        colorTag: "danger",
        reminderEnabled: true,
        reminderTime: 15,
        notes: "Completed - covered chapters 1-5",
        relatedClassId: createdClasses[1].id // Related to Calculus
      },
      {
        title: "Reading Discussion",
        description: "Book club meeting",
        platform: "google_meet",
        meetingType: "group",
        status: "canceled",
        startTime: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endTime: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
        meetingUrl: "https://meet.google.com/jkl-mnop-qrs",
        meetingId: "jkl-mnop-qrs",
        password: null,
        hostUserId: defaultUser.id,
        colorTag: "purple",
        reminderEnabled: false,
        reminderTime: 15,
        notes: "Canceled due to low attendance",
        relatedHabitId: createdHabits[1].id // Related to Reading habit
      }
    ];

    // Create meetings
    const createdMeetings: Meeting[] = [];
    for (const meeting of exampleMeetings) {
      const createdMeeting = await this.createMeeting(meeting);
      createdMeetings.push(createdMeeting);

      // Add some participants for each meeting
      if (meeting.status !== "canceled") {
        const participantNames = [
          "Alice Johnson",
          "Bob Smith",
          "Charlie Brown",
          "Diana Prince",
          "Edward Nygma"
        ];

        for (let i = 0; i < 3; i++) { // Add 3 participants per meeting
          await this.addMeetingParticipant({
            meetingId: createdMeeting.id,
            name: participantNames[i],
            email: `${participantNames[i].toLowerCase().replace(' ', '.')}@example.com`,
            status: i === 0 ? "confirmed" : "pending",
            notificationSent: true
          });
        }
      }
    }

    // Create a meeting from template as an example
    const templateMeeting = await this.createMeetingFromTemplate(
      createdTemplates[0].id, // Quick Check-in template
      new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      {
        title: "Quick Workout Check-in", 
        relatedHabitId: createdHabits[0].id // Related to Morning Workout
      }
    );
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Set default notification settings if not provided
    const defaultNotificationSettings = {
      enabled: false,
      phoneNumber: undefined,
      notifyBeforeClass: false,
      notifyMissedClass: false,
      reminderTime: 30
    };
    
    const user: User = { 
      ...insertUser, 
      id,
      notificationSettings: insertUser.notificationSettings ?? defaultNotificationSettings
    };
    
    this.users.set(id, user);
    return user;
  }
  
  // Notification settings methods
  async getNotificationSettings(userId: number): Promise<NotificationSettings | undefined> {
    const user = await this.getUser(userId);
    return user?.notificationSettings;
  }
  
  async updateNotificationSettings(userId: number, settings: NotificationSettings): Promise<NotificationSettings | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // Update user with new notification settings
    const updatedUser: User = {
      ...user,
      notificationSettings: settings
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser.notificationSettings;
  }

  // Habit methods
  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.habitId++;
    const now = new Date();
    
    // Ensure proper typing by explicitly setting fields
    const habit: Habit & { categoryId?: number, tagIds?: number[] } = { 
      id,
      name: insertHabit.name,
      description: insertHabit.description ?? null,
      frequency: insertHabit.frequency as "daily" | "weekly" | "monthly", // Type assertion for safety
      reminderTime: insertHabit.reminderTime ?? null,
      colorTag: insertHabit.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink", // Type assertion for safety
      createdAt: now 
    };
    
    // Add categoryId if provided (extend with custom property)
    if ('categoryId' in insertHabit && typeof (insertHabit as any).categoryId === 'number') {
      habit.categoryId = (insertHabit as any).categoryId;
    }
    
    // Add tagIds if provided (extend with custom property)
    if ('tagIds' in insertHabit && Array.isArray((insertHabit as any).tagIds)) {
      habit.tagIds = (insertHabit as any).tagIds;
    }
    
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, habitUpdate: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;

    // Preserve extended properties
    const extendedProps: { categoryId?: number, tagIds?: number[] } = {};
    
    // Keep existing categoryId if present
    if ('categoryId' in habit) {
      extendedProps.categoryId = (habit as any).categoryId;
    }
    
    // Keep existing tagIds if present
    if ('tagIds' in habit) {
      extendedProps.tagIds = (habit as any).tagIds;
    }
    
    // Update categoryId if provided in update
    if ('categoryId' in habitUpdate) {
      extendedProps.categoryId = (habitUpdate as any).categoryId;
    }
    
    // Update tagIds if provided in update
    if ('tagIds' in habitUpdate) {
      extendedProps.tagIds = (habitUpdate as any).tagIds;
    }

    // Type-safe update
    const updatedHabit: Habit & { categoryId?: number, tagIds?: number[] } = {
      id: habit.id,
      name: habitUpdate.name ?? habit.name,
      description: habitUpdate.description !== undefined ? habitUpdate.description : habit.description,
      frequency: (habitUpdate.frequency as "daily" | "weekly" | "monthly") ?? habit.frequency,
      reminderTime: habitUpdate.reminderTime !== undefined ? habitUpdate.reminderTime : habit.reminderTime,
      colorTag: (habitUpdate.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink") ?? habit.colorTag,
      createdAt: habit.createdAt,
      ...extendedProps  // Add extended properties
    };
    
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Habit Record methods
  async getHabitRecords(habitId?: number, startDate?: Date, endDate?: Date): Promise<HabitRecord[]> {
    let records = Array.from(this.habitRecords.values());
    
    if (habitId !== undefined) {
      records = records.filter(record => record.habitId === habitId);
    }
    
    if (startDate) {
      records = records.filter(record => new Date(record.date) >= startDate);
    }
    
    if (endDate) {
      records = records.filter(record => new Date(record.date) <= endDate);
    }
    
    return records;
  }

  async getHabitRecord(habitId: number, date: Date): Promise<HabitRecord | undefined> {
    const dateString = date.toDateString();
    return Array.from(this.habitRecords.values()).find(
      record => record.habitId === habitId && new Date(record.date).toDateString() === dateString
    );
  }

  async createHabitRecord(insertRecord: InsertHabitRecord): Promise<HabitRecord> {
    const id = this.recordId++;
    const record: HabitRecord = { ...insertRecord, id };
    this.habitRecords.set(id, record);
    return record;
  }

  async updateHabitRecord(id: number, recordUpdate: Partial<InsertHabitRecord>): Promise<HabitRecord | undefined> {
    const record = this.habitRecords.get(id);
    if (!record) return undefined;

    const updatedRecord = { ...record, ...recordUpdate };
    this.habitRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  // College Class methods
  async getCollegeClasses(): Promise<CollegeClass[]> {
    return Array.from(this.collegeClasses.values());
  }

  async getCollegeClass(id: number): Promise<CollegeClass | undefined> {
    return this.collegeClasses.get(id);
  }

  async createCollegeClass(insertClass: InsertCollegeClass): Promise<CollegeClass> {
    const id = this.collegeClassId++;
    const now = new Date();
    
    // Ensure proper typing by explicitly setting fields
    const collegeClass: CollegeClass = { 
      id,
      name: insertClass.name,
      courseCode: insertClass.courseCode,
      instructor: insertClass.instructor ?? null,
      dayOfWeek: insertClass.dayOfWeek as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday", // Type assertion for safety
      startTime: insertClass.startTime,
      endTime: insertClass.endTime,
      location: insertClass.location ?? null,
      colorTag: insertClass.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink", // Type assertion for safety
      createdAt: now 
    };
    
    this.collegeClasses.set(id, collegeClass);
    return collegeClass;
  }

  async updateCollegeClass(id: number, classUpdate: Partial<InsertCollegeClass>): Promise<CollegeClass | undefined> {
    const collegeClass = this.collegeClasses.get(id);
    if (!collegeClass) return undefined;

    // Type-safe update
    const updatedClass: CollegeClass = {
      id: collegeClass.id,
      name: classUpdate.name ?? collegeClass.name,
      courseCode: classUpdate.courseCode ?? collegeClass.courseCode,
      instructor: classUpdate.instructor !== undefined ? classUpdate.instructor : collegeClass.instructor,
      dayOfWeek: (classUpdate.dayOfWeek as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday") ?? collegeClass.dayOfWeek,
      startTime: classUpdate.startTime ?? collegeClass.startTime,
      endTime: classUpdate.endTime ?? collegeClass.endTime,
      location: classUpdate.location !== undefined ? classUpdate.location : collegeClass.location,
      colorTag: (classUpdate.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink") ?? collegeClass.colorTag,
      createdAt: collegeClass.createdAt
    };
    
    this.collegeClasses.set(id, updatedClass);
    return updatedClass;
  }

  async deleteCollegeClass(id: number): Promise<boolean> {
    return this.collegeClasses.delete(id);
  }

  // Class Attendance methods
  async getClassAttendanceRecords(classId?: number, startDate?: Date, endDate?: Date): Promise<ClassAttendance[]> {
    let records = Array.from(this.classAttendances.values());
    
    if (classId !== undefined) {
      records = records.filter(record => record.classId === classId);
    }
    
    if (startDate) {
      records = records.filter(record => new Date(record.date) >= startDate);
    }
    
    if (endDate) {
      records = records.filter(record => new Date(record.date) <= endDate);
    }
    
    return records;
  }

  async getClassAttendance(classId: number, date: Date): Promise<ClassAttendance | undefined> {
    const dateString = date.toDateString();
    return Array.from(this.classAttendances.values()).find(
      record => record.classId === classId && new Date(record.date).toDateString() === dateString
    );
  }

  async createClassAttendance(insertRecord: InsertClassAttendance): Promise<ClassAttendance> {
    const id = this.classAttendanceId++;
    const record: ClassAttendance = { 
      ...insertRecord, 
      id,
      notes: insertRecord.notes ?? null 
    };
    this.classAttendances.set(id, record);
    return record;
  }

  async updateClassAttendance(id: number, recordUpdate: Partial<InsertClassAttendance>): Promise<ClassAttendance | undefined> {
    const record = this.classAttendances.get(id);
    if (!record) return undefined;

    const updatedRecord: ClassAttendance = {
      ...record,
      classId: recordUpdate.classId ?? record.classId,
      date: recordUpdate.date ?? record.date,
      attended: recordUpdate.attended !== undefined ? recordUpdate.attended : record.attended,
      notes: recordUpdate.notes !== undefined ? recordUpdate.notes : record.notes
    };
    
    this.classAttendances.set(id, updatedRecord);
    return updatedRecord;
  }

  // College statistics
  async getAttendanceStats(): Promise<{ attended: number, skipped: number, total: number }> {
    const records = Array.from(this.classAttendances.values());
    const attended = records.filter(record => record.attended).length;
    const skipped = records.filter(record => !record.attended).length;
    
    return {
      attended,
      skipped,
      total: attended + skipped
    };
  }

  // Habit Category methods
  async getHabitCategories(): Promise<HabitCategory[]> {
    return Array.from(this.habitCategories.values());
  }

  async getHabitCategory(id: number): Promise<HabitCategory | undefined> {
    return this.habitCategories.get(id);
  }

  async createHabitCategory(insertCategory: InsertHabitCategory): Promise<HabitCategory> {
    const id = this.categoryId++;
    const now = new Date();
    
    const category: HabitCategory = { 
      id,
      name: insertCategory.name,
      description: insertCategory.description ?? null,
      colorTag: insertCategory.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink",
      createdAt: now 
    };
    
    this.habitCategories.set(id, category);
    return category;
  }

  async updateHabitCategory(id: number, categoryUpdate: Partial<InsertHabitCategory>): Promise<HabitCategory | undefined> {
    const category = this.habitCategories.get(id);
    if (!category) return undefined;

    // Type-safe update
    const updatedCategory: HabitCategory = {
      id: category.id,
      name: categoryUpdate.name ?? category.name,
      description: categoryUpdate.description !== undefined ? categoryUpdate.description : category.description,
      colorTag: (categoryUpdate.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink") ?? category.colorTag,
      createdAt: category.createdAt
    };
    
    this.habitCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteHabitCategory(id: number): Promise<boolean> {
    return this.habitCategories.delete(id);
  }

  // Habit Tag methods
  async getHabitTags(): Promise<HabitTag[]> {
    return Array.from(this.habitTags.values());
  }

  async getHabitTag(id: number): Promise<HabitTag | undefined> {
    return this.habitTags.get(id);
  }

  async createHabitTag(insertTag: InsertHabitTag): Promise<HabitTag> {
    const id = this.tagId++;
    const now = new Date();
    
    const tag: HabitTag = { 
      id,
      name: insertTag.name,
      colorTag: insertTag.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink",
      createdAt: now 
    };
    
    this.habitTags.set(id, tag);
    return tag;
  }

  async updateHabitTag(id: number, tagUpdate: Partial<InsertHabitTag>): Promise<HabitTag | undefined> {
    const tag = this.habitTags.get(id);
    if (!tag) return undefined;

    // Type-safe update
    const updatedTag: HabitTag = {
      id: tag.id,
      name: tagUpdate.name ?? tag.name,
      colorTag: (tagUpdate.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink") ?? tag.colorTag,
      createdAt: tag.createdAt
    };
    
    this.habitTags.set(id, updatedTag);
    return updatedTag;
  }

  async deleteHabitTag(id: number): Promise<boolean> {
    return this.habitTags.delete(id);
  }

  // Get habits by category
  async getHabitsByCategory(categoryId: number): Promise<Habit[]> {
    // In a real database this would be a JOIN query
    // For in-memory storage, we filter habits with matching categoryId
    return Array.from(this.habits.values()).filter(habit => 
      'categoryId' in habit && (habit as any).categoryId === categoryId
    );
  }

  // Get habits by tag
  async getHabitsByTag(tagId: string): Promise<Habit[]> {
    // In a real database this would be a JOIN query on a many-to-many relationship
    // For in-memory storage, we assume habits have a tags array
    return Array.from(this.habits.values()).filter(habit => 
      'tags' in habit && Array.isArray((habit as any).tags) && (habit as any).tags.includes(tagId)
    );
  }

  // Meeting methods
  async getMeetings(userId?: number, startDate?: Date, endDate?: Date): Promise<Meeting[]> {
    let meetings = Array.from(this.meetings.values());
    
    if (userId !== undefined) {
      meetings = meetings.filter(meeting => meeting.hostUserId === userId);
    }
    
    if (startDate) {
      meetings = meetings.filter(meeting => new Date(meeting.startTime) >= startDate);
    }
    
    if (endDate) {
      meetings = meetings.filter(meeting => new Date(meeting.startTime) <= endDate);
    }
    
    return meetings;
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingsByPlatform(platform: MeetingPlatform): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => meeting.platform === platform);
  }

  async getMeetingsByType(meetingType: MeetingType): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => meeting.meetingType === meetingType);
  }

  async getMeetingsByStatus(status: MeetingStatus): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => meeting.status === status);
  }

  async getMeetingsByRelatedHabit(habitId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => meeting.relatedHabitId === habitId);
  }

  async getMeetingsByRelatedClass(classId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => meeting.relatedClassId === classId);
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingId++;
    const now = new Date();
    
    const meeting: Meeting = {
      id,
      title: insertMeeting.title,
      description: insertMeeting.description ?? null,
      platform: insertMeeting.platform,
      meetingType: insertMeeting.meetingType,
      status: insertMeeting.status ?? "scheduled",
      startTime: insertMeeting.startTime,
      endTime: insertMeeting.endTime,
      meetingUrl: insertMeeting.meetingUrl ?? null,
      meetingId: insertMeeting.meetingId ?? null,
      password: insertMeeting.password ?? null,
      hostUserId: insertMeeting.hostUserId,
      colorTag: insertMeeting.colorTag ?? "primary",
      reminderEnabled: insertMeeting.reminderEnabled ?? true,
      reminderTime: insertMeeting.reminderTime ?? 15,
      notes: insertMeeting.notes ?? null,
      relatedHabitId: insertMeeting.relatedHabitId ?? null,
      relatedClassId: insertMeeting.relatedClassId ?? null,
      createdAt: now,
      updatedAt: now
    };
    
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meetingUpdate: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;

    const updatedMeeting: Meeting = {
      ...meeting,
      ...meetingUpdate,
      updatedAt: new Date()
    };
    
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    return this.meetings.delete(id);
  }

  // Meeting participant methods
  async getMeetingParticipants(meetingId: number): Promise<MeetingParticipant[]> {
    return Array.from(this.meetingParticipants.values()).filter(
      participant => participant.meetingId === meetingId
    );
  }

  async getMeetingParticipant(id: number): Promise<MeetingParticipant | undefined> {
    return this.meetingParticipants.get(id);
  }

  async addMeetingParticipant(insertParticipant: InsertMeetingParticipant): Promise<MeetingParticipant> {
    const id = this.meetingParticipantId++;
    const now = new Date();
    
    const participant: MeetingParticipant = {
      id,
      meetingId: insertParticipant.meetingId,
      userId: insertParticipant.userId ?? null,
      name: insertParticipant.name ?? null,
      email: insertParticipant.email ?? null,
      status: insertParticipant.status ?? "pending",
      notificationSent: insertParticipant.notificationSent ?? false,
      joinedAt: insertParticipant.joinedAt ?? null,
      leftAt: insertParticipant.leftAt ?? null,
      createdAt: now
    };
    
    this.meetingParticipants.set(id, participant);
    return participant;
  }

  async updateMeetingParticipant(id: number, participantUpdate: Partial<InsertMeetingParticipant>): Promise<MeetingParticipant | undefined> {
    const participant = this.meetingParticipants.get(id);
    if (!participant) return undefined;

    const updatedParticipant: MeetingParticipant = {
      ...participant,
      ...participantUpdate
    };
    
    this.meetingParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async removeMeetingParticipant(id: number): Promise<boolean> {
    return this.meetingParticipants.delete(id);
  }

  // Meeting template methods
  async getMeetingTemplates(userId: number): Promise<MeetingTemplate[]> {
    return Array.from(this.meetingTemplates.values()).filter(
      template => template.userId === userId
    );
  }

  async getMeetingTemplate(id: number): Promise<MeetingTemplate | undefined> {
    return this.meetingTemplates.get(id);
  }

  async createMeetingTemplate(insertTemplate: InsertMeetingTemplate): Promise<MeetingTemplate> {
    const id = this.meetingTemplateId++;
    const now = new Date();
    
    const template: MeetingTemplate = {
      id,
      name: insertTemplate.name,
      description: insertTemplate.description ?? null,
      platform: insertTemplate.platform ?? null,
      meetingType: insertTemplate.meetingType ?? null,
      duration: insertTemplate.duration,
      meetingUrlTemplate: insertTemplate.meetingUrlTemplate ?? null,
      colorTag: insertTemplate.colorTag ?? "primary",
      reminderEnabled: insertTemplate.reminderEnabled ?? true,
      reminderTime: insertTemplate.reminderTime ?? 15,
      notes: insertTemplate.notes ?? null,
      userId: insertTemplate.userId,
      createdAt: now
    };
    
    this.meetingTemplates.set(id, template);
    return template;
  }

  async updateMeetingTemplate(id: number, templateUpdate: Partial<InsertMeetingTemplate>): Promise<MeetingTemplate | undefined> {
    const template = this.meetingTemplates.get(id);
    if (!template) return undefined;

    const updatedTemplate: MeetingTemplate = {
      ...template,
      ...templateUpdate
    };
    
    this.meetingTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteMeetingTemplate(id: number): Promise<boolean> {
    return this.meetingTemplates.delete(id);
  }

  async createMeetingFromTemplate(templateId: number, startTime: Date, additionalData?: Partial<InsertMeeting>): Promise<Meeting> {
    const template = await this.getMeetingTemplate(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }
    
    // Calculate end time based on template duration and provided start time
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + template.duration);
    
    // Create meeting data from template
    const meetingData: InsertMeeting = {
      title: template.name,
      description: template.description,
      platform: template.platform as MeetingPlatform,
      meetingType: template.meetingType as MeetingType,
      startTime,
      endTime,
      hostUserId: template.userId,
      colorTag: template.colorTag,
      reminderEnabled: template.reminderEnabled,
      reminderTime: template.reminderTime,
      notes: template.notes,
      meetingUrl: template.meetingUrlTemplate,
      ...additionalData
    };
    
    // Create the actual meeting
    return this.createMeeting(meetingData);
  }
}

export const storage = new MemStorage();
