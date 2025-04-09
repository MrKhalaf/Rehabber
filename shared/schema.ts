import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Exercise Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  userId: true,
});

// Exercises
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps"),
  holdDuration: integer("hold_duration"), // in seconds
  equipment: text("equipment"),
  restBetweenSets: integer("rest_between_sets"), // in seconds
  techniqueTip: text("technique_tip"),
  videoUrl: text("video_url"),
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  name: true,
  description: true,
  categoryId: true,
  userId: true,
  sets: true,
  reps: true,
  holdDuration: true,
  equipment: true,
  restBetweenSets: true,
  techniqueTip: true,
  videoUrl: true,
});

// Exercise Logs
export const exerciseLogs = pgTable("exercise_logs", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id").notNull(),
  userId: integer("user_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  setsCompleted: integer("sets_completed").notNull(),
  notes: text("notes"),
});

export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).pick({
  exerciseId: true,
  userId: true,
  setsCompleted: true,
  notes: true,
});

// Recommended Videos
export const recommendedVideos = pgTable("recommended_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url").notNull(),
  userId: integer("user_id"),
  recommendedBy: text("recommended_by"),
});

export const insertRecommendedVideoSchema = createInsertSchema(recommendedVideos).pick({
  title: true,
  source: true,
  thumbnailUrl: true,
  videoUrl: true,
  userId: true,
  recommendedBy: true,
});

// PT Notes
export const ptNotes = pgTable("pt_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  parsedExercises: json("parsed_exercises"),
});

export const insertPtNoteSchema = createInsertSchema(ptNotes).pick({
  userId: true,
  content: true,
  parsedExercises: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type InsertExerciseLog = z.infer<typeof insertExerciseLogSchema>;

export type RecommendedVideo = typeof recommendedVideos.$inferSelect;
export type InsertRecommendedVideo = z.infer<typeof insertRecommendedVideoSchema>;

export type PtNote = typeof ptNotes.$inferSelect;
export type InsertPtNote = z.infer<typeof insertPtNoteSchema>;
