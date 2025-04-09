import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  exerciseInsertSchema, 
  exerciseProgressInsertSchema, 
  programInsertSchema,
  ptNotesParserSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Get all exercises
  app.get("/api/exercises", async (req: Request, res: Response) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });
  
  // Get exercises by category
  app.get("/api/exercises/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const exercises = await storage.getExercisesByCategory(category);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises by category" });
    }
  });
  
  // Get a single exercise
  app.get("/api/exercises/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }
      
      const exercise = await storage.getExercise(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });
  
  // Create a new exercise
  app.post("/api/exercises", async (req: Request, res: Response) => {
    try {
      const validatedData = exerciseInsertSchema.parse(req.body);
      const exercise = await storage.createExercise(validatedData);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });
  
  // Update an exercise
  app.patch("/api/exercises/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }
      
      // Partial validation
      const validatedData = exerciseInsertSchema.partial().parse(req.body);
      
      const updatedExercise = await storage.updateExercise(id, validatedData);
      if (!updatedExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(updatedExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });
  
  // Delete an exercise
  app.delete("/api/exercises/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }
      
      const success = await storage.deleteExercise(id);
      if (!success) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exercise" });
    }
  });
  
  // Record exercise progress
  app.post("/api/progress", async (req: Request, res: Response) => {
    try {
      const validatedData = exerciseProgressInsertSchema.parse(req.body);
      const progress = await storage.createExerciseProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record progress" });
    }
  });
  
  // Get progress for a specific exercise
  app.get("/api/progress/:exerciseId", async (req: Request, res: Response) => {
    try {
      const exerciseId = parseInt(req.params.exerciseId);
      if (isNaN(exerciseId)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }
      
      const progress = await storage.getExerciseProgress(exerciseId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });
  
  // Get all programs
  app.get("/api/programs", async (req: Request, res: Response) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });
  
  // Get a single program
  app.get("/api/programs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid program ID" });
      }
      
      const program = await storage.getProgram(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });
  
  // Create a new program
  app.post("/api/programs", async (req: Request, res: Response) => {
    try {
      const validatedData = programInsertSchema.parse(req.body);
      const program = await storage.createProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create program" });
    }
  });
  
  // Update a program
  app.patch("/api/programs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid program ID" });
      }
      
      // Partial validation
      const validatedData = programInsertSchema.partial().parse(req.body);
      
      const updatedProgram = await storage.updateProgram(id, validatedData);
      if (!updatedProgram) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(updatedProgram);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid program data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update program" });
    }
  });
  
  // Delete a program
  app.delete("/api/programs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid program ID" });
      }
      
      const success = await storage.deleteProgram(id);
      if (!success) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete program" });
    }
  });
  
  // Parse PT notes to create exercises
  app.post("/api/parse-pt-notes", async (req: Request, res: Response) => {
    try {
      const { plainText } = ptNotesParserSchema.parse(req.body);
      
      // This is a very simple parser that looks for patterns in the text
      // A more sophisticated parser would be needed for production
      const exercises = [];
      
      // Split by newlines and look for exercise patterns
      const lines = plainText.split('\n');
      for (const line of lines) {
        // Try to match patterns like "Exercise name: 3x10 reps"
        const exerciseMatch = line.match(/^(.+?):\s*(\d+)\s*x\s*(\d+)\s*(reps|sec|seconds)/i);
        if (exerciseMatch) {
          const [_, name, sets, duration, type] = exerciseMatch;
          
          // Determine if it's a rep or hold exercise
          const isHold = type.toLowerCase().includes('sec');
          
          // Create an exercise
          const exercise = {
            name: name.trim(),
            category: "Other", // Default category
            type: isHold ? "hold" : "rep",
            sets: parseInt(sets),
            instructions: ["Perform as instructed by your physical therapist"]
          };
          
          // Add appropriate duration field
          if (isHold) {
            exercise.holdDuration = parseInt(duration);
          } else {
            exercise.reps = parseInt(duration);
          }
          
          // Add to exercises array
          exercises.push(exercise);
        }
      }
      
      // Return the parsed exercises
      res.json({ 
        exercises,
        message: `Parsed ${exercises.length} exercises from your PT notes`
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid PT notes data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to parse PT notes" });
    }
  });

  return httpServer;
}
