import { 
  exercises, type Exercise, type InsertExercise,
  exerciseProgress, type ExerciseProgress, type InsertExerciseProgress,
  programs, type Program, type InsertProgram,
  users, type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Exercise operations
  getExercises(): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<boolean>;
  
  // Exercise Progress operations
  getExerciseProgress(exerciseId: number): Promise<ExerciseProgress[]>;
  createExerciseProgress(progress: InsertExerciseProgress): Promise<ExerciseProgress>;
  
  // Program operations
  getPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, program: Partial<InsertProgram>): Promise<Program | undefined>;
  deleteProgram(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Exercise methods
  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }
  
  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise;
  }
  
  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return await db.select().from(exercises).where(eq(exercises.category, category));
  }
  
  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db.insert(exercises).values(insertExercise).returning();
    return exercise;
  }
  
  async updateExercise(id: number, exerciseUpdate: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const [updatedExercise] = await db
      .update(exercises)
      .set(exerciseUpdate)
      .where(eq(exercises.id, id))
      .returning();
    return updatedExercise;
  }
  
  async deleteExercise(id: number): Promise<boolean> {
    const [deletedExercise] = await db
      .delete(exercises)
      .where(eq(exercises.id, id))
      .returning();
    return !!deletedExercise;
  }
  
  // Exercise Progress methods
  async getExerciseProgress(exerciseId: number): Promise<ExerciseProgress[]> {
    return await db
      .select()
      .from(exerciseProgress)
      .where(eq(exerciseProgress.exerciseId, exerciseId))
      .orderBy(desc(exerciseProgress.completedAt));
  }
  
  async createExerciseProgress(insertProgress: InsertExerciseProgress): Promise<ExerciseProgress> {
    const [progress] = await db
      .insert(exerciseProgress)
      .values({
        ...insertProgress,
        completedAt: insertProgress.completedAt || new Date()
      })
      .returning();
    return progress;
  }
  
  // Program methods
  async getPrograms(): Promise<Program[]> {
    return await db.select().from(programs);
  }
  
  async getProgram(id: number): Promise<Program | undefined> {
    const [program] = await db.select().from(programs).where(eq(programs.id, id));
    return program;
  }
  
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db.insert(programs).values(insertProgram).returning();
    return program;
  }
  
  async updateProgram(id: number, programUpdate: Partial<InsertProgram>): Promise<Program | undefined> {
    const [updatedProgram] = await db
      .update(programs)
      .set(programUpdate)
      .where(eq(programs.id, id))
      .returning();
    return updatedProgram;
  }
  
  async deleteProgram(id: number): Promise<boolean> {
    const [deletedProgram] = await db
      .delete(programs)
      .where(eq(programs.id, id))
      .returning();
    return !!deletedProgram;
  }
  
  // Helper to seed initial exercises if none exist
  async seedDefaultExercisesIfNeeded(): Promise<void> {
    const existingExercises = await this.getExercises();
    if (existingExercises.length === 0) {
      // McGill Big 3 - Core Stability exercises
      await this.createExercise({
        name: "McGill Big 3 - Bird Dog",
        category: "Core Stability",
        type: "hold",
        sets: 4,
        holdDuration: 20, // 20 seconds hold
        restTime: 30,
        instructions: [
          "Start on your hands and knees",
          "Extend one arm forward and the opposite leg backward",
          "Hold for the prescribed time while maintaining a neutral spine",
          "Return to starting position and repeat with the opposite arm and leg"
        ],
        isPaired: true
      });
      
      await this.createExercise({
        name: "McGill Big 3 - Side Plank",
        category: "Core Stability",
        type: "hold",
        sets: 3,
        holdDuration: 10, // 10 seconds hold
        restTime: 30,
        instructions: [
          "Lie on your side with your elbow directly under your shoulder",
          "Engage your core and lift your hips to create a straight line from head to feet",
          "Hold this position for the indicated time",
          "Breathe normally and maintain a neutral spine",
          "Repeat on the other side"
        ],
        isPaired: true
      });
      
      await this.createExercise({
        name: "McGill Big 3 - Curl-up",
        category: "Core Stability",
        type: "hold",
        sets: 4,
        holdDuration: 15, // 15 seconds hold
        restTime: 30,
        instructions: [
          "Lie on your back with one knee bent and one leg straight",
          "Place your hands under your lower back to maintain the natural curve",
          "Lift your head and shoulders slightly off the ground",
          "Hold the position without flexing your spine",
          "Switch leg positions after each set"
        ],
        isPaired: false
      });
      
      // Lower Body exercises
      await this.createExercise({
        name: "Glute Bridge",
        category: "Lower Body",
        type: "rep",
        sets: 3,
        reps: 15,
        restTime: 45,
        instructions: [
          "Lie on your back with knees bent and feet flat on the floor",
          "Push through your heels to lift your hips up toward the ceiling",
          "Squeeze your glutes at the top",
          "Lower back down with control",
          "Repeat for the prescribed number of repetitions"
        ],
        isPaired: false
      });
      
      await this.createExercise({
        name: "Bodyweight Squat",
        category: "Lower Body",
        type: "rep",
        sets: 3,
        reps: 10,
        restTime: 60,
        instructions: [
          "Stand with feet shoulder-width apart",
          "Bend your knees and push your hips back as if sitting in a chair",
          "Keep your chest up and knees aligned with your toes",
          "Lower until thighs are parallel to the ground, or as deep as comfortable",
          "Push through your heels to return to standing",
          "Repeat for the prescribed number of repetitions"
        ],
        isPaired: false
      });
      
      // Upper Body exercises
      await this.createExercise({
        name: "Wall Push-up",
        category: "Upper Body",
        type: "rep",
        sets: 3,
        reps: 12,
        restTime: 45,
        instructions: [
          "Stand facing a wall at arm's length",
          "Place your hands on the wall at shoulder height",
          "Bend your elbows to bring your chest toward the wall",
          "Push back to the starting position",
          "Repeat for the prescribed number of repetitions"
        ],
        isPaired: false
      });
      
      await this.createExercise({
        name: "Resistance Band Rows",
        category: "Upper Body",
        type: "rep",
        sets: 4,
        reps: 10,
        restTime: 60,
        notes: "Equipment: Red resistance band",
        equipmentNeeded: "Red resistance band",
        instructions: [
          "Secure a resistance band at chest height",
          "Hold the band with both hands and step back until there's tension",
          "Stand with feet shoulder-width apart, knees slightly bent",
          "Pull the band toward your chest, squeezing your shoulder blades together",
          "Slowly return to the starting position",
          "Repeat for the prescribed number of repetitions"
        ],
        isPaired: false
      });
    }
  }
}

// Initialize database storage and seed data if needed
export const storage = new DatabaseStorage();

// Call this after server starts to seed initial data if needed
export async function initializeDatabase() {
  await (storage as DatabaseStorage).seedDefaultExercisesIfNeeded();
}
