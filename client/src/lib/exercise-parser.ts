import { InsertExercise } from "@shared/schema";

interface ParsedExercise {
  name: string;
  sets?: number;
  reps?: number;
  holdDuration?: number;
  equipment?: string;
}

/**
 * Parses physical therapist notes to extract exercise information
 * @param text The raw text from PT notes
 * @returns Array of parsed exercises
 */
export function parseExerciseFromText(text: string): ParsedExercise[] {
  if (!text) return [];

  const exercises: ParsedExercise[] = [];
  
  // Common patterns in PT notes
  const lines = text.split(/\r?\n/);
  
  lines.forEach(line => {
    if (!line.trim()) return;
    
    // Try to extract exercise information from the line
    // Pattern: Exercise name followed by sets/reps/duration information
    const exerciseMatch = line.match(/([a-zA-Z\s-]+)(?:\s*[-:]\s*)?(?:.+)?/i);
    
    if (exerciseMatch) {
      const name = exerciseMatch[1]?.trim();
      if (!name) return;
      
      const exercise: ParsedExercise = { name };
      
      // Extract sets (e.g., "3 sets", "3x", "3 sets of")
      const setsMatch = line.match(/(\d+)\s*(?:sets?|x)/i);
      if (setsMatch) {
        exercise.sets = parseInt(setsMatch[1]);
      }
      
      // Extract reps (e.g., "10 reps", "10 repetitions", "10x")
      const repsMatch = line.match(/(\d+)\s*(?:reps?|repetitions?|times)/i);
      if (repsMatch) {
        exercise.reps = parseInt(repsMatch[1]);
      }
      
      // Extract hold duration (e.g., "5 seconds hold", "5s hold", "hold for 5 seconds")
      const holdMatch = line.match(/(?:hold\s+for\s+)?(\d+)\s*(?:s|sec|seconds?)(?:\s+hold)?/i);
      if (holdMatch) {
        exercise.holdDuration = parseInt(holdMatch[1]);
      }
      
      // Extract equipment (e.g., "with red band", "using weights")
      const equipmentMatch = line.match(/(?:with|using)\s+([a-zA-Z\s]+(?:band|weight|ball|block|strap|machine|bar))/i);
      if (equipmentMatch) {
        exercise.equipment = equipmentMatch[1]?.trim();
      }
      
      exercises.push(exercise);
    }
  });
  
  return exercises;
}

/**
 * Converts parsed exercises to InsertExercise format for storage
 * @param parsedExercises Array of parsed exercises
 * @param categoryId Category ID for the exercises
 * @param userId User ID for the exercises
 * @returns Array of InsertExercise objects
 */
export function convertToInsertExercises(
  parsedExercises: ParsedExercise[], 
  categoryId: number, 
  userId: number
): Partial<InsertExercise>[] {
  return parsedExercises.map(exercise => ({
    name: exercise.name,
    categoryId,
    userId,
    sets: exercise.sets || 3, // Default to 3 sets if not specified
    reps: exercise.reps,
    holdDuration: exercise.holdDuration,
    equipment: exercise.equipment,
    restBetweenSets: 60, // Default rest time between sets
  }));
}

/**
 * Makes a POST request to the server to parse PT notes
 * @param content The raw text from PT notes
 * @returns Promise with parsed exercises
 */
export async function parsePtNotesFromServer(content: string): Promise<ParsedExercise[]> {
  try {
    const response = await fetch('/api/parse-pt-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to parse PT notes');
    }
    
    const data = await response.json();
    return data.parsedExercises;
  } catch (error) {
    console.error('Error parsing PT notes:', error);
    // Fallback to client-side parsing if server fails
    return parseExerciseFromText(content);
  }
}
