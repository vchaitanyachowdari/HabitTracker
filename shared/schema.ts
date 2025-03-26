import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Definition of habit frequency types
export const habitFrequencies = ["daily", "weekly", "monthly"] as const;
export type HabitFrequency = typeof habitFrequencies[number];

// Definition of habit color types
export const habitColors = ["primary", "secondary", "accent", "danger", "purple", "pink"] as const;
export type HabitColor = typeof habitColors[number];

// Define the habits table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull().$type<HabitFrequency>(),
  reminderTime: text("reminder_time"),
  colorTag: text("color_tag").notNull().$type<HabitColor>(),
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
