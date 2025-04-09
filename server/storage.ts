import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  exercises, type Exercise, type InsertExercise,
  exerciseLogs, type ExerciseLog, type InsertExerciseLog,
  recommendedVideos, type RecommendedVideo, type InsertRecommendedVideo,
  ptNotes, type PtNote, type InsertPtNote,
} from "@shared/schema";

// In-memory storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Exercise operations
  getExercises(userId: number): Promise<Exercise[]>;
  getExercisesByCategory(categoryId: number): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<boolean>;

  // Exercise Log operations
  getExerciseLogs(userId: number): Promise<ExerciseLog[]>;
  getExerciseLogsByExercise(exerciseId: number): Promise<ExerciseLog[]>;
  createExerciseLog(log: InsertExerciseLog): Promise<ExerciseLog>;

  // Recommended Videos operations
  getRecommendedVideos(userId: number): Promise<RecommendedVideo[]>;
  getRecommendedVideo(id: number): Promise<RecommendedVideo | undefined>;
  createRecommendedVideo(video: InsertRecommendedVideo): Promise<RecommendedVideo>;

  // PT Notes operations
  getPtNotes(userId: number): Promise<PtNote[]>;
  getPtNote(id: number): Promise<PtNote | undefined>;
  createPtNote(note: InsertPtNote): Promise<PtNote>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private exercises: Map<number, Exercise>;
  private exerciseLogs: Map<number, ExerciseLog>;
  private recommendedVideos: Map<number, RecommendedVideo>;
  private ptNotes: Map<number, PtNote>;

  private userIdCounter: number;
  private categoryIdCounter: number;
  private exerciseIdCounter: number;
  private exerciseLogIdCounter: number;
  private recommendedVideoIdCounter: number;
  private ptNoteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.exercises = new Map();
    this.exerciseLogs = new Map();
    this.recommendedVideos = new Map();
    this.ptNotes = new Map();

    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.exerciseIdCounter = 1;
    this.exerciseLogIdCounter = 1;
    this.recommendedVideoIdCounter = 1;
    this.ptNoteIdCounter = 1;

    // Initialize with sample data
    this.initSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.userId === userId,
    );
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: Category = { ...category, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Exercise operations
  async getExercises(userId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.userId === userId,
    );
  }

  async getExercisesByCategory(categoryId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.categoryId === categoryId,
    );
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseIdCounter++;
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async updateExercise(id: number, exerciseUpdate: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;
    
    const updatedExercise: Exercise = { ...exercise, ...exerciseUpdate };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async deleteExercise(id: number): Promise<boolean> {
    return this.exercises.delete(id);
  }

  // Exercise Log operations
  async getExerciseLogs(userId: number): Promise<ExerciseLog[]> {
    return Array.from(this.exerciseLogs.values()).filter(
      (log) => log.userId === userId,
    );
  }

  async getExerciseLogsByExercise(exerciseId: number): Promise<ExerciseLog[]> {
    return Array.from(this.exerciseLogs.values()).filter(
      (log) => log.exerciseId === exerciseId,
    );
  }

  async createExerciseLog(insertLog: InsertExerciseLog): Promise<ExerciseLog> {
    const id = this.exerciseLogIdCounter++;
    const log: ExerciseLog = { 
      ...insertLog, 
      id, 
      completedAt: insertLog.completedAt || new Date() 
    };
    this.exerciseLogs.set(id, log);
    return log;
  }

  // Recommended Videos operations
  async getRecommendedVideos(userId: number): Promise<RecommendedVideo[]> {
    return Array.from(this.recommendedVideos.values()).filter(
      (video) => video.userId === userId || video.userId === null,
    );
  }

  async getRecommendedVideo(id: number): Promise<RecommendedVideo | undefined> {
    return this.recommendedVideos.get(id);
  }

  async createRecommendedVideo(insertVideo: InsertRecommendedVideo): Promise<RecommendedVideo> {
    const id = this.recommendedVideoIdCounter++;
    const video: RecommendedVideo = { ...insertVideo, id };
    this.recommendedVideos.set(id, video);
    return video;
  }

  // PT Notes operations
  async getPtNotes(userId: number): Promise<PtNote[]> {
    return Array.from(this.ptNotes.values()).filter(
      (note) => note.userId === userId,
    );
  }

  async getPtNote(id: number): Promise<PtNote | undefined> {
    return this.ptNotes.get(id);
  }

  async createPtNote(insertNote: InsertPtNote): Promise<PtNote> {
    const id = this.ptNoteIdCounter++;
    const note: PtNote = { 
      ...insertNote, 
      id, 
      uploadedAt: new Date() 
    };
    this.ptNotes.set(id, note);
    return note;
  }

  // Initialize with sample data for demonstration
  private initSampleData() {
    // Create a demo user
    const demoUser: User = {
      id: this.userIdCounter++,
      username: 'demo',
      password: 'password'
    };
    this.users.set(demoUser.id, demoUser);

    // Create categories
    const coreCategory: Category = {
      id: this.categoryIdCounter++,
      name: 'Core Stability (McGill Big 3)',
      userId: demoUser.id
    };
    this.categories.set(coreCategory.id, coreCategory);

    const lowerBodyCategory: Category = {
      id: this.categoryIdCounter++,
      name: 'Lower Body Rehabilitation',
      userId: demoUser.id
    };
    this.categories.set(lowerBodyCategory.id, lowerBodyCategory);

    // Create exercises
    const exercises: Partial<Exercise>[] = [
      {
        name: 'Bird Dog',
        description: 'Quadruped exercise for core stability',
        categoryId: coreCategory.id,
        userId: demoUser.id,
        sets: 3,
        reps: 10,
        holdDuration: 5,
        techniqueTip: 'Keep your back flat and core engaged. Move opposite arm and leg simultaneously.'
      },
      {
        name: 'Side Plank',
        description: 'Lateral core stabilization exercise',
        categoryId: coreCategory.id,
        userId: demoUser.id,
        sets: 3,
        holdDuration: 20,
        techniqueTip: 'Stack your feet and hips. Keep your body in a straight line. Breathe normally.'
      },
      {
        name: 'Modified Curl-up',
        description: 'Core flexion with minimal spine movement',
        categoryId: coreCategory.id,
        userId: demoUser.id,
        sets: 3,
        reps: 8,
        holdDuration: 10,
        techniqueTip: 'Keep one leg straight and one bent. Support your lower back with hands.'
      },
      {
        name: 'Glute Bridge',
        description: 'Posterior chain activation',
        categoryId: lowerBodyCategory.id,
        userId: demoUser.id,
        sets: 4,
        reps: 15,
        holdDuration: 2,
        techniqueTip: 'Squeeze glutes at the top. Keep core engaged.'
      },
      {
        name: 'Single-Leg Balance',
        description: 'Balance training for lower extremity',
        categoryId: lowerBodyCategory.id,
        userId: demoUser.id,
        sets: 3,
        holdDuration: 30,
        techniqueTip: 'Keep your core engaged and maintain a soft bend in the supporting knee. Focus on a point in front of you for balance.'
      },
      {
        name: 'Mini Squat with Band',
        description: 'Strengthening exercise with resistance',
        categoryId: lowerBodyCategory.id,
        userId: demoUser.id,
        sets: 3,
        reps: 12,
        equipment: 'Red resistance band',
        techniqueTip: 'Keep the band taught throughout the exercise. Maintain knees in line with toes.'
      }
    ];

    exercises.forEach(ex => {
      const exercise: Exercise = {
        id: this.exerciseIdCounter++,
        description: '',
        equipment: null,
        restBetweenSets: 60,
        videoUrl: null,
        ...ex
      } as Exercise;
      this.exercises.set(exercise.id, exercise);
    });

    // Create exercise logs
    const completedExercises = [
      { exerciseId: 1, userId: demoUser.id, setsCompleted: 3, completedAt: new Date(Date.now() - 120 * 60000) },
      { exerciseId: 2, userId: demoUser.id, setsCompleted: 3, completedAt: new Date(Date.now() - 105 * 60000) },
      { exerciseId: 3, userId: demoUser.id, setsCompleted: 3, completedAt: new Date(Date.now() - 100 * 60000) },
      { exerciseId: 4, userId: demoUser.id, setsCompleted: 4, completedAt: new Date(Date.now() - 60 * 60000) }
    ];

    completedExercises.forEach(ex => {
      const log: ExerciseLog = {
        id: this.exerciseLogIdCounter++,
        notes: null,
        ...ex
      };
      this.exerciseLogs.set(log.id, log);
    });

    // Create recommended videos
    const videos: Partial<RecommendedVideo>[] = [
      {
        title: '3 Core Exercises to Do Every Day',
        source: 'YouTube',
        thumbnailUrl: 'https://via.placeholder.com/150',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        recommendedBy: 'Dr. Smith'
      },
      {
        title: 'Proper Form for McGill Big 3',
        source: 'YouTube',
        thumbnailUrl: 'https://via.placeholder.com/150',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        recommendedBy: 'Physical Therapy Expert'
      }
    ];

    videos.forEach(v => {
      const video: RecommendedVideo = {
        id: this.recommendedVideoIdCounter++,
        userId: null,
        ...v
      } as RecommendedVideo;
      this.recommendedVideos.set(video.id, video);
    });
  }
}

// Export a single instance to be used throughout the application
export const storage = new MemStorage();
