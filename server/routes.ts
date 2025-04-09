import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema,
  insertCategorySchema,
  insertExerciseSchema,
  insertExerciseLogSchema,
  insertRecommendedVideoSchema,
  insertPtNoteSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.router("/api");
  
  // Error handling middleware
  function handleApiError(res: Response, error: any) {
    console.error("API Error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: error.message || "An unexpected error occurred" });
  }

  // User routes
  apiRouter.post("/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Category routes
  apiRouter.get("/categories", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.post("/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.put("/categories/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.delete("/categories/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Exercise routes
  apiRouter.get("/exercises", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      let exercises;
      if (categoryId && !isNaN(categoryId)) {
        exercises = await storage.getExercisesByCategory(categoryId);
      } else {
        exercises = await storage.getExercises(userId);
      }
      
      res.json(exercises);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.get("/exercises/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const exercise = await storage.getExercise(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.post("/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.put("/exercises/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const exerciseData = insertExerciseSchema.partial().parse(req.body);
      const exercise = await storage.updateExercise(id, exerciseData);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.delete("/exercises/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid id is required" });
      }
      
      const deleted = await storage.deleteExercise(id);
      if (!deleted) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Exercise Log routes
  apiRouter.get("/exercise-logs", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      const exerciseId = req.query.exerciseId ? Number(req.query.exerciseId) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      let logs;
      if (exerciseId && !isNaN(exerciseId)) {
        logs = await storage.getExerciseLogsByExercise(exerciseId);
      } else {
        logs = await storage.getExerciseLogs(userId);
      }
      
      res.json(logs);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.post("/exercise-logs", async (req, res) => {
    try {
      const logData = insertExerciseLogSchema.parse(req.body);
      const log = await storage.createExerciseLog(logData);
      res.status(201).json(log);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Recommended Videos routes
  apiRouter.get("/recommended-videos", async (req, res) => {
    try {
      const userId = Number(req.query.userId) || null;
      const videos = await storage.getRecommendedVideos(userId);
      res.json(videos);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.post("/recommended-videos", async (req, res) => {
    try {
      const videoData = insertRecommendedVideoSchema.parse(req.body);
      const video = await storage.createRecommendedVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // PT Notes routes
  apiRouter.get("/pt-notes", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }
      
      const notes = await storage.getPtNotes(userId);
      res.json(notes);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  apiRouter.post("/pt-notes", async (req, res) => {
    try {
      const noteData = insertPtNoteSchema.parse(req.body);
      const note = await storage.createPtNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Parse PT notes endpoint
  apiRouter.post("/parse-pt-notes", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Content is required and must be a string" });
      }
      
      // Parse PT notes to extract exercises
      // This is a simplified parser that extracts basic exercise information
      const exerciseRegex = /([a-zA-Z\s-]+)(?:\s*[-:]\s*)?(?:(\d+)\s*(?:sets|x)\s*)?(?:(\d+)\s*(?:reps|repetitions)\s*)?(?:(\d+)\s*(?:s|sec|seconds)\s*(?:hold|duration))?/gi;
      
      const parsedExercises = [];
      let match;
      
      while ((match = exerciseRegex.exec(content)) !== null) {
        const [_, name, sets, reps, holdDuration] = match;
        
        if (name && name.trim()) {
          parsedExercises.push({
            name: name.trim(),
            sets: sets ? parseInt(sets) : null,
            reps: reps ? parseInt(reps) : null,
            holdDuration: holdDuration ? parseInt(holdDuration) : null
          });
        }
      }
      
      res.json({ parsedExercises });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
