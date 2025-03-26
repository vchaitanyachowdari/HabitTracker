import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertHabitRecordSchema } from "@shared/schema";
import { log } from "./vite";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { calendarIntegrations } from "./integrations";

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

  // Register the router with the /api prefix
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
