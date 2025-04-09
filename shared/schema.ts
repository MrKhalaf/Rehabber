import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Exercise Category enum
export const exerciseCategoryEnum = z.enum([
  "Core Stability",
  "Lower Body",
  "Upper Body",
  "Mobility",
  "Other"
]);

export type ExerciseCategory = z.infer<typeof exerciseCategoryEnum>;

// Exercise Type enum
export const exerciseTypeEnum = z.enum([
  "rep", // Regular repetitions
  "hold", // Timed hold (like planks)
  "step" // Multi-step exercise
]);

export type ExerciseType = z.infer<typeof exerciseTypeEnum>;

// Exercise Definition
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Using the ExerciseCategory enum values
  type: text("type").notNull(), // Using the ExerciseType enum values
  sets: integer("sets").notNull(),
  reps: integer("reps").default(0), // Used for rep-based exercises
  holdDuration: integer("hold_duration").default(0), // In seconds, for hold-based exercises
  restTime: integer("rest_time").default(60), // In seconds
  notes: text("notes"),
  equipmentNeeded: text("equipment_needed"),
  videoUrl: text("video_url"),
  instructions: text("instructions").array(),
  isPaired: boolean("is_paired").default(false), // For exercises with left/right sides
});

export const exerciseInsertSchema = createInsertSchema(exercises).omit({
  id: true
}).extend({
  category: exerciseCategoryEnum,
  type: exerciseTypeEnum,
  instructions: z.array(z.string())
});

// Exercise Progress
export const exerciseProgress = pgTable("exercise_progress", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  completedSets: integer("completed_sets").notNull(),
  notes: text("notes")
});

export const exerciseProgressInsertSchema = createInsertSchema(exerciseProgress).omit({
  id: true
});

// User-defined custom programs (collection of exercises)
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  exercises: jsonb("exercises").notNull() // Array of exercise IDs with order
});

export const programInsertSchema = createInsertSchema(programs).omit({
  id: true
});

// Type definitions
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof exerciseInsertSchema>;

export type ExerciseProgress = typeof exerciseProgress.$inferSelect;
export type InsertExerciseProgress = z.infer<typeof exerciseProgressInsertSchema>;

export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof programInsertSchema>;

// PT Notes Parser Schema - used for frontend validation
export const ptNotesParserSchema = z.object({
  plainText: z.string().min(1, "Please enter your physical therapist's notes"),
});

// User Schema (from existing template)
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
