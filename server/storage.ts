import { 
  exercises, type Exercise, type InsertExercise,
  exerciseProgress, type ExerciseProgress, type InsertExerciseProgress,
  programs, type Program, type InsertProgram,
  users, type User, type InsertUser
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private exercises: Map<number, Exercise>;
  private exerciseProgress: Map<number, ExerciseProgress>;
  private programs: Map<number, Program>;
  
  private userCurrentId: number;
  private exerciseCurrentId: number;
  private progressCurrentId: number;
  private programCurrentId: number;

  constructor() {
    this.users = new Map();
    this.exercises = new Map();
    this.exerciseProgress = new Map();
    this.programs = new Map();
    
    this.userCurrentId = 1;
    this.exerciseCurrentId = 1;
    this.progressCurrentId = 1;
    this.programCurrentId = 1;
    
    // Add some default exercises
    this.initializeDefaultExercises();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Exercise methods
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }
  
  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }
  
  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.category === category
    );
  }
  
  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseCurrentId++;
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }
  
  async updateExercise(id: number, exerciseUpdate: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;
    
    const updatedExercise = { ...exercise, ...exerciseUpdate };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }
  
  async deleteExercise(id: number): Promise<boolean> {
    return this.exercises.delete(id);
  }
  
  // Exercise Progress methods
  async getExerciseProgress(exerciseId: number): Promise<ExerciseProgress[]> {
    return Array.from(this.exerciseProgress.values()).filter(
      (progress) => progress.exerciseId === exerciseId
    );
  }
  
  async createExerciseProgress(insertProgress: InsertExerciseProgress): Promise<ExerciseProgress> {
    const id = this.progressCurrentId++;
    const progress: ExerciseProgress = { 
      ...insertProgress, 
      id,
      completedAt: insertProgress.completedAt || new Date()
    };
    this.exerciseProgress.set(id, progress);
    return progress;
  }
  
  // Program methods
  async getPrograms(): Promise<Program[]> {
    return Array.from(this.programs.values());
  }
  
  async getProgram(id: number): Promise<Program | undefined> {
    return this.programs.get(id);
  }
  
  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.programCurrentId++;
    const program: Program = { ...insertProgram, id };
    this.programs.set(id, program);
    return program;
  }
  
  async updateProgram(id: number, programUpdate: Partial<InsertProgram>): Promise<Program | undefined> {
    const program = this.programs.get(id);
    if (!program) return undefined;
    
    const updatedProgram = { ...program, ...programUpdate };
    this.programs.set(id, updatedProgram);
    return updatedProgram;
  }
  
  async deleteProgram(id: number): Promise<boolean> {
    return this.programs.delete(id);
  }
  
  // Initialize with default exercises
  private initializeDefaultExercises() {
    // McGill Big 3 - Core Stability exercises
    this.createExercise({
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
    
    this.createExercise({
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
    
    this.createExercise({
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
    this.createExercise({
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
    
    this.createExercise({
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
    this.createExercise({
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
    
    this.createExercise({
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

export const storage = new MemStorage();
