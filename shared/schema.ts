import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the notification settings schema
export const notificationSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  phoneNumber: z.string().optional(),
  notifyBeforeClass: z.boolean().default(false),
  notifyMissedClass: z.boolean().default(false),
  reminderTime: z.number().min(5).max(60).default(30).optional(), // minutes before class
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  notificationSettings: jsonb("notification_settings").$type<NotificationSettings>(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  notificationSettings: notificationSettingsSchema.optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Definition of habit frequency types
export const habitFrequencies = ["daily", "weekly", "monthly"] as const;
export type HabitFrequency = typeof habitFrequencies[number];

// Definition of habit color types
export const habitColors = ["primary", "secondary", "accent", "danger", "purple", "pink"] as const;
export type HabitColor = typeof habitColors[number];

// Define default habit categories
export const defaultHabitCategories = [
  "Health & Fitness",
  "Productivity",
  "Learning",
  "Mindfulness",
  "Finance",
  "Social",
  "Personal Growth",
  "Other"
] as const;
export type DefaultHabitCategory = typeof defaultHabitCategories[number];

// Define the habit categories table
export const habitCategories = pgTable("habit_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  colorTag: text("color_tag").$type<HabitColor>(),
  icon: text("icon"), // Store icon name (e.g., "dumbbell", "book")
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHabitCategorySchema = createInsertSchema(habitCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertHabitCategory = z.infer<typeof insertHabitCategorySchema>;
export type HabitCategory = typeof habitCategories.$inferSelect;

// Define the habit tags table
export const habitTags = pgTable("habit_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  colorTag: text("color_tag").$type<HabitColor>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHabitTagSchema = createInsertSchema(habitTags).omit({
  id: true,
  createdAt: true,
});

export type InsertHabitTag = z.infer<typeof insertHabitTagSchema>;
export type HabitTag = typeof habitTags.$inferSelect;

// Define the habits table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull().$type<HabitFrequency>(),
  reminderTime: text("reminder_time"),
  colorTag: text("color_tag").notNull().$type<HabitColor>(),
  categoryId: integer("category_id"), // Reference to habit_categories
  tags: jsonb("tags").default([]).$type<string[]>(), // Store tag IDs as an array
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Define the habit records table (for tracking completions)
export const habitRecords = pgTable("habit_records", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").notNull(),
});

export const insertHabitRecordSchema = createInsertSchema(habitRecords).omit({
  id: true,
});

export type InsertHabitRecord = z.infer<typeof insertHabitRecordSchema>;
export type HabitRecord = typeof habitRecords.$inferSelect;

// College classes tracking feature
export const collegeDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export type CollegeDay = typeof collegeDays[number];

// Define the college classes table
export const collegeClasses = pgTable("college_classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  courseCode: text("course_code").notNull(),
  instructor: text("instructor"),
  dayOfWeek: text("day_of_week").notNull().$type<CollegeDay>(),
  startTime: text("start_time").notNull(), // Format: "HH:MM"
  endTime: text("end_time").notNull(), // Format: "HH:MM"
  location: text("location"),
  colorTag: text("color_tag").notNull().$type<HabitColor>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCollegeClassSchema = createInsertSchema(collegeClasses).omit({
  id: true,
  createdAt: true,
});

export type InsertCollegeClass = z.infer<typeof insertCollegeClassSchema>;
export type CollegeClass = typeof collegeClasses.$inferSelect;

// Define the class attendance table
export const classAttendance = pgTable("class_attendance", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  date: timestamp("date").notNull(),
  attended: boolean("attended").notNull(), // true = attended, false = skipped
  notes: text("notes"),
});

export const insertClassAttendanceSchema = createInsertSchema(classAttendance).omit({
  id: true,
});

export type InsertClassAttendance = z.infer<typeof insertClassAttendanceSchema>;
export type ClassAttendance = typeof classAttendance.$inferSelect;
