import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema, 
  insertHabitRecordSchema,
  insertCollegeClassSchema,
  insertClassAttendanceSchema,
  notificationSettingsSchema,
  insertHabitCategorySchema,
  insertHabitTagSchema,
  insertUserSchema
} from "@shared/schema";
import { log } from "./vite";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { calendarIntegrations } from "./integrations";
import { authService } from "./services/auth";
import { authenticateJWT, optionalAuthenticateJWT } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Get all habits
  router.get("/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error) {
      log(`Error fetching habits: ${error}`);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  // Get a specific habit
  router.get("/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const habit = await storage.getHabit(id);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      log(`Error fetching habit: ${error}`);
      res.status(500).json({ message: "Failed to fetch habit" });
    }
  });

  // Create a new habit
  router.post("/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error creating habit: ${error}`);
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  // Update a habit
  router.patch("/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const habitData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(id, habitData);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error updating habit: ${error}`);
      res.status(500).json({ message: "Failed to update habit" });
    }
  });

  // Delete a habit
  router.delete("/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }

      const success = await storage.deleteHabit(id);
      if (!success) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      log(`Error deleting habit: ${error}`);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Get habit records with optional filters
  router.get("/habit-records", async (req, res) => {
    try {
      const habitId = req.query.habitId ? parseInt(req.query.habitId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (habitId !== undefined && isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      if (startDate && isNaN(startDate.getTime()) || endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const records = await storage.getHabitRecords(habitId, startDate, endDate);
      res.json(records);
    } catch (error) {
      log(`Error fetching habit records: ${error}`);
      res.status(500).json({ message: "Failed to fetch habit records" });
    }
  });

  // Get a specific habit record for a habit and date
  router.get("/habits/:habitId/records/:date", async (req, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const date = new Date(req.params.date);
      
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const record = await storage.getHabitRecord(habitId, date);
      if (!record) {
        return res.status(404).json({ message: "Habit record not found" });
      }
      
      res.json(record);
    } catch (error) {
      log(`Error fetching habit record: ${error}`);
      res.status(500).json({ message: "Failed to fetch habit record" });
    }
  });

  // Create or update a habit record
  router.post("/habit-records", async (req, res) => {
    try {
      // First, ensure data is valid
      const recordData = insertHabitRecordSchema.parse(req.body);
      
      // Check if a record already exists for this habit and date
      const existingRecord = await storage.getHabitRecord(
        recordData.habitId, 
        new Date(recordData.date)
      );
      
      let record;
      
      if (existingRecord) {
        // Update the existing record
        record = await storage.updateHabitRecord(existingRecord.id, recordData);
      } else {
        // Create a new record
        record = await storage.createHabitRecord(recordData);
      }
      
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error creating/updating habit record: ${error}`);
      res.status(500).json({ message: "Failed to create/update habit record" });
    }
  });

  // Update a habit record
  router.patch("/habit-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid record ID" });
      }

      const recordData = insertHabitRecordSchema.partial().parse(req.body);
      const record = await storage.updateHabitRecord(id, recordData);
      
      if (!record) {
        return res.status(404).json({ message: "Habit record not found" });
      }
      
      res.json(record);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error updating habit record: ${error}`);
      res.status(500).json({ message: "Failed to update habit record" });
    }
  });

  // Calendar Integration Routes
  
  // Sync habits to Google Calendar
  router.post("/integrations/google-calendar/sync", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      const habitRecords = await storage.getHabitRecords();
      
      const success = await calendarIntegrations.syncToGoogleCalendar(habits, habitRecords);
      
      if (success) {
        res.json({ success: true, message: "Successfully synced habits to Google Calendar" });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Failed to sync habits to Google Calendar. Make sure you have provided the necessary credentials." 
        });
      }
    } catch (error) {
      log(`Error syncing to Google Calendar: ${error}`);
      res.status(500).json({ success: false, message: "Failed to sync habits to Google Calendar" });
    }
  });
  
  // Get Google Calendar auth URL
  router.get("/integrations/google-calendar/auth-url", (req, res) => {
    try {
      const authUrl = calendarIntegrations.getGoogleAuthUrl();
      
      if (authUrl) {
        res.json({ url: authUrl });
      } else {
        res.status(400).json({ 
          message: "Failed to generate Google Calendar authorization URL. Make sure you have provided the necessary credentials." 
        });
      }
    } catch (error) {
      log(`Error generating Google Calendar auth URL: ${error}`);
      res.status(500).json({ message: "Failed to generate Google Calendar authorization URL" });
    }
  });
  
  // Handle Google Calendar OAuth callback
  router.get("/auth/google/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }
      
      const success = await calendarIntegrations.handleGoogleCallback(code);
      
      if (success) {
        // Redirect to the frontend with success message
        res.redirect(`/?google_auth_success=true`);
      } else {
        // Redirect to the frontend with error message
        res.redirect(`/?google_auth_error=true`);
      }
    } catch (error) {
      log(`Error handling Google Calendar callback: ${error}`);
      res.redirect(`/?google_auth_error=true`);
    }
  });
  
  // Sync habits to Notion
  router.post("/integrations/notion/sync", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      const habitRecords = await storage.getHabitRecords();
      
      const success = await calendarIntegrations.syncToNotion(habits, habitRecords);
      
      if (success) {
        res.json({ success: true, message: "Successfully synced habits to Notion" });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Failed to sync habits to Notion. Make sure you have provided the necessary API key." 
        });
      }
    } catch (error) {
      log(`Error syncing to Notion: ${error}`);
      res.status(500).json({ success: false, message: "Failed to sync habits to Notion" });
    }
  });
  
  // Sync habits to all connected services
  router.post("/integrations/sync-all", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      const habitRecords = await storage.getHabitRecords();
      
      const results = await calendarIntegrations.syncToAllServices(habits, habitRecords);
      
      res.json({
        success: results.google || results.notion,
        results: {
          google: {
            success: results.google,
            message: results.google 
              ? "Successfully synced to Google Calendar" 
              : "Failed to sync to Google Calendar"
          },
          notion: {
            success: results.notion,
            message: results.notion 
              ? "Successfully synced to Notion" 
              : "Failed to sync to Notion"
          }
        }
      });
    } catch (error) {
      log(`Error syncing to all services: ${error}`);
      res.status(500).json({ success: false, message: "Failed to sync habits to external services" });
    }
  });

  // College Class Routes

  // Get all college classes
  router.get("/college/classes", async (req, res) => {
    try {
      const classes = await storage.getCollegeClasses();
      res.json(classes);
    } catch (error) {
      log(`Error fetching college classes: ${error}`);
      res.status(500).json({ message: "Failed to fetch college classes" });
    }
  });

  // Get a specific college class
  router.get("/college/classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }

      const collegeClass = await storage.getCollegeClass(id);
      if (!collegeClass) {
        return res.status(404).json({ message: "College class not found" });
      }
      
      res.json(collegeClass);
    } catch (error) {
      log(`Error fetching college class: ${error}`);
      res.status(500).json({ message: "Failed to fetch college class" });
    }
  });

  // Create a new college class
  router.post("/college/classes", async (req, res) => {
    try {
      const classData = insertCollegeClassSchema.parse(req.body);
      const collegeClass = await storage.createCollegeClass(classData);
      res.status(201).json(collegeClass);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error creating college class: ${error}`);
      res.status(500).json({ message: "Failed to create college class" });
    }
  });

  // Update a college class
  router.patch("/college/classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }

      const classData = insertCollegeClassSchema.partial().parse(req.body);
      const collegeClass = await storage.updateCollegeClass(id, classData);
      
      if (!collegeClass) {
        return res.status(404).json({ message: "College class not found" });
      }
      
      res.json(collegeClass);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error updating college class: ${error}`);
      res.status(500).json({ message: "Failed to update college class" });
    }
  });

  // Delete a college class
  router.delete("/college/classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }

      const success = await storage.deleteCollegeClass(id);
      if (!success) {
        return res.status(404).json({ message: "College class not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      log(`Error deleting college class: ${error}`);
      res.status(500).json({ message: "Failed to delete college class" });
    }
  });

  // Class Attendance Routes

  // Get class attendance records with optional filters
  router.get("/college/attendance", async (req, res) => {
    try {
      const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      if (classId !== undefined && isNaN(classId)) {
        return res.status(400).json({ message: "Invalid class ID" });
      }
      
      if (startDate && isNaN(startDate.getTime()) || endDate && isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const records = await storage.getClassAttendanceRecords(classId, startDate, endDate);
      res.json(records);
    } catch (error) {
      log(`Error fetching class attendance records: ${error}`);
      res.status(500).json({ message: "Failed to fetch class attendance records" });
    }
  });

  // Create or update an attendance record
  router.post("/college/attendance", async (req, res) => {
    try {
      // First, ensure data is valid
      const recordData = insertClassAttendanceSchema.parse(req.body);
      
      // Check if a record already exists for this class and date
      const existingRecord = await storage.getClassAttendance(
        recordData.classId, 
        new Date(recordData.date)
      );
      
      let record;
      
      if (existingRecord) {
        // Update the existing record
        record = await storage.updateClassAttendance(existingRecord.id, recordData);
      } else {
        // Create a new record
        record = await storage.createClassAttendance(recordData);
      }
      
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error creating/updating class attendance record: ${error}`);
      res.status(500).json({ message: "Failed to create/update class attendance record" });
    }
  });

  // Update an attendance record
  router.patch("/college/attendance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid record ID" });
      }

      const recordData = insertClassAttendanceSchema.partial().parse(req.body);
      const record = await storage.updateClassAttendance(id, recordData);
      
      if (!record) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      res.json(record);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error updating attendance record: ${error}`);
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  // Get attendance statistics
  router.get("/college/attendance/stats", async (req, res) => {
    try {
      const stats = await storage.getAttendanceStats();
      res.json(stats);
    } catch (error) {
      log(`Error fetching attendance stats: ${error}`);
      res.status(500).json({ message: "Failed to fetch attendance statistics" });
    }
  });
  
  // Notification Settings Routes
  
  // Get notification settings for the authenticated user
  router.get("/notification-settings", authenticateJWT, async (req, res) => {
    try {
      const userId = req.userId;
      
      const settings = await storage.getNotificationSettings(userId);
      if (!settings) {
        return res.status(404).json({ message: "Notification settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      log(`Error fetching notification settings: ${error}`);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });
  
  // Update notification settings for the authenticated user
  router.patch("/notification-settings", authenticateJWT, async (req, res) => {
    try {
      const userId = req.userId;
      
      const settingsData = notificationSettingsSchema.parse(req.body);
      const settings = await storage.updateNotificationSettings(userId, settingsData);
      
      if (!settings) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error updating notification settings: ${error}`);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });
  
  // Check notification service status
  router.get("/notification-service/status", async (req, res) => {
    try {
      // Import notification service here to avoid circular dependencies
      const { notificationService } = await import("./services/notification");
      const isEnabled = notificationService.isServiceEnabled();
      
      res.json({
        enabled: isEnabled,
        message: isEnabled 
          ? "WhatsApp notification service is available" 
          : "WhatsApp notification service is not available. Make sure you've provided the required Twilio credentials."
      });
    } catch (error) {
      log(`Error checking notification service status: ${error}`);
      res.status(500).json({ message: "Failed to check notification service status" });
    }
  });

  // Habit Category Routes

  // Get all habit categories
  router.get("/habit-categories", async (req, res) => {
    try {
      const categories = await storage.getHabitCategories();
      res.json(categories);
    } catch (error) {
      log(`Error fetching habit categories: ${error}`);
      res.status(500).json({ message: "Failed to fetch habit categories" });
    }
  });

  // Get a specific habit category
  router.get("/habit-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getHabitCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Habit category not found" });
      }
      
      res.json(category);
    } catch (error) {
      log(`Error fetching habit category: ${error}`);
      res.status(500).json({ message: "Failed to fetch habit category" });
    }
  });

  // Create a new habit category
  router.post("/habit-categories", async (req, res) => {
    try {
      const categoryData = insertHabitCategorySchema.parse(req.body);
      const category = await storage.createHabitCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error creating habit category: ${error}`);
      res.status(500).json({ message: "Failed to create habit category" });
    }
  });

  // Update a habit category
  router.patch("/habit-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const categoryData = insertHabitCategorySchema.partial().parse(req.body);
      const category = await storage.updateHabitCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Habit category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error updating habit category: ${error}`);
      res.status(500).json({ message: "Failed to update habit category" });
    }
  });

  // Delete a habit category
  router.delete("/habit-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const success = await storage.deleteHabitCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Habit category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      log(`Error deleting habit category: ${error}`);
      res.status(500).json({ message: "Failed to delete habit category" });
    }
  });

  // Get all habits in a category
  router.get("/habit-categories/:id/habits", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const habits = await storage.getHabitsByCategory(id);
      res.json(habits);
    } catch (error) {
      log(`Error fetching habits by category: ${error}`);
      res.status(500).json({ message: "Failed to fetch habits by category" });
    }
  });

  // Habit Tag Routes

  // Get all habit tags
  router.get("/habit-tags", async (req, res) => {
    try {
      const tags = await storage.getHabitTags();
      res.json(tags);
    } catch (error) {
      log(`Error fetching habit tags: ${error}`);
      res.status(500).json({ message: "Failed to fetch habit tags" });
    }
  });

  // Get a specific habit tag
  router.get("/habit-tags/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      const tag = await storage.getHabitTag(id);
      if (!tag) {
        return res.status(404).json({ message: "Habit tag not found" });
      }
      
      res.json(tag);
    } catch (error) {
      log(`Error fetching habit tag: ${error}`);
      res.status(500).json({ message: "Failed to fetch habit tag" });
    }
  });

  // Create a new habit tag
  router.post("/habit-tags", async (req, res) => {
    try {
      const tagData = insertHabitTagSchema.parse(req.body);
      const tag = await storage.createHabitTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error creating habit tag: ${error}`);
      res.status(500).json({ message: "Failed to create habit tag" });
    }
  });

  // Update a habit tag
  router.patch("/habit-tags/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      const tagData = insertHabitTagSchema.partial().parse(req.body);
      const tag = await storage.updateHabitTag(id, tagData);
      
      if (!tag) {
        return res.status(404).json({ message: "Habit tag not found" });
      }
      
      res.json(tag);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      log(`Error updating habit tag: ${error}`);
      res.status(500).json({ message: "Failed to update habit tag" });
    }
  });

  // Delete a habit tag
  router.delete("/habit-tags/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      const success = await storage.deleteHabitTag(id);
      if (!success) {
        return res.status(404).json({ message: "Habit tag not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      log(`Error deleting habit tag: ${error}`);
      res.status(500).json({ message: "Failed to delete habit tag" });
    }
  });

  // Get all habits with a specific tag
  router.get("/habit-tags/:id/habits", async (req, res) => {
    try {
      const id = req.params.id; // Tags can be string IDs
      const habits = await storage.getHabitsByTag(id);
      res.json(habits);
    } catch (error) {
      log(`Error fetching habits by tag: ${error}`);
      res.status(500).json({ message: "Failed to fetch habits by tag" });
    }
  });

  // Authentication Routes

  // Register a new user
  router.post("/auth/register", async (req, res) => {
    try {
      // Validate user data
      const userData = insertUserSchema.parse(req.body);
      
      // Register the user
      const user = await authService.register(userData);
      
      // Generate an authentication token
      const token = authService.generateToken(user);
      
      // Return the user data and token
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username,
          notificationSettings: user.notificationSettings
        }, 
        token 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      if (error.message === 'Username already exists') {
        return res.status(409).json({ message: error.message });
      }
      
      log(`Error registering user: ${error}`);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Login
  router.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Authenticate the user
      const { user, token } = await authService.login(username, password);
      
      // Return the user data and token
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username,
          notificationSettings: user.notificationSettings
        }, 
        token 
      });
    } catch (error) {
      if (error.message === 'Invalid username or password') {
        return res.status(401).json({ message: error.message });
      }
      
      log(`Error during login: ${error}`);
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Get current user data
  router.get("/auth/me", authenticateJWT, async (req, res) => {
    try {
      // The user data is already attached to the request by the authenticateJWT middleware
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return the user data
      res.json({ 
        id: user.id, 
        username: user.username,
        notificationSettings: user.notificationSettings
      });
    } catch (error) {
      log(`Error fetching user data: ${error}`);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Register the router with the /api prefix
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
