import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertHabitRecordSchema } from "@shared/schema";
import { log } from "./vite";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

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

  // Register the router with the /api prefix
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
