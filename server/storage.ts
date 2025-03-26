import { habits, type Habit, type InsertHabit, habitRecords, type HabitRecord, type InsertHabitRecord, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Habit CRUD operations
  getHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit Record operations
  getHabitRecords(habitId?: number, startDate?: Date, endDate?: Date): Promise<HabitRecord[]>;
  getHabitRecord(habitId: number, date: Date): Promise<HabitRecord | undefined>;
  createHabitRecord(record: InsertHabitRecord): Promise<HabitRecord>;
  updateHabitRecord(id: number, record: Partial<InsertHabitRecord>): Promise<HabitRecord | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private habits: Map<number, Habit>;
  private habitRecords: Map<number, HabitRecord>;
  private userId: number;
  private habitId: number;
  private recordId: number;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitRecords = new Map();
    this.userId = 1;
    this.habitId = 1;
    this.recordId = 1;

    // Add some initial habits for demonstration
    // We need to use Promise.resolve because we can't make the constructor async
    Promise.resolve().then(() => this.initializeData());
  }

  private async initializeData() {
    // Creating example habits
    const exampleHabits: InsertHabit[] = [
      { name: "Morning Workout", description: "30 min workout routine", frequency: "daily", reminderTime: "07:00", colorTag: "secondary" },
      { name: "Read 30 Minutes", description: "Read a book", frequency: "daily", reminderTime: "19:00", colorTag: "primary" },
      { name: "Meditate", description: "10 min meditation", frequency: "daily", reminderTime: "08:00", colorTag: "accent" },
      { name: "No Social Media", description: "Avoid social platforms", frequency: "daily", reminderTime: null, colorTag: "danger" },
      { name: "Drink 2L Water", description: "Stay hydrated", frequency: "daily", reminderTime: null, colorTag: "primary" },
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const habit: Habit = { 
      id,
      name: insertHabit.name,
      description: insertHabit.description ?? null,
      frequency: insertHabit.frequency as "daily" | "weekly" | "monthly", // Type assertion for safety
      reminderTime: insertHabit.reminderTime ?? null,
      colorTag: insertHabit.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink", // Type assertion for safety
      createdAt: now 
    };
    
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, habitUpdate: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;

    // Type-safe update
    const updatedHabit: Habit = {
      id: habit.id,
      name: habitUpdate.name ?? habit.name,
      description: habitUpdate.description !== undefined ? habitUpdate.description : habit.description,
      frequency: (habitUpdate.frequency as "daily" | "weekly" | "monthly") ?? habit.frequency,
      reminderTime: habitUpdate.reminderTime !== undefined ? habitUpdate.reminderTime : habit.reminderTime,
      colorTag: (habitUpdate.colorTag as "primary" | "secondary" | "accent" | "danger" | "purple" | "pink") ?? habit.colorTag,
      createdAt: habit.createdAt
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
}

export const storage = new MemStorage();
