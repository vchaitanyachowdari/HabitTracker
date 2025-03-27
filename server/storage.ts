import { 
  habits, type Habit, type InsertHabit, 
  habitRecords, type HabitRecord, type InsertHabitRecord, 
  users, type User, type InsertUser,
  collegeClasses, type CollegeClass, type InsertCollegeClass,
  classAttendance, type ClassAttendance, type InsertClassAttendance,
  type NotificationSettings,
  habitCategories, type HabitCategory, type InsertHabitCategory,
  habitTags, type HabitTag, type InsertHabitTag,
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private habitRecords: Map<number, HabitRecord>;
  private habitCategories: Map<number, HabitCategory>;
  private habitTags: Map<number, HabitTag>;
  private collegeClasses: Map<number, CollegeClass>;
  private classAttendances: Map<number, ClassAttendance>;
  private userId: number;
  private habitId: number;
  private recordId: number;
  private categoryId: number;
  private tagId: number;
  private collegeClassId: number;
  private classAttendanceId: number;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitRecords = new Map();
    this.habitCategories = new Map();
    this.habitTags = new Map();
    this.collegeClasses = new Map();
    this.classAttendances = new Map();
    this.userId = 1;
    this.habitId = 1;
    this.recordId = 1;
    this.categoryId = 1;
    this.tagId = 1;
    this.collegeClassId = 1;
    this.classAttendanceId = 1;

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
}

export const storage = new MemStorage();
