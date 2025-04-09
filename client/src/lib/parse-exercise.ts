import { InsertExercise, exerciseCategoryEnum, exerciseTypeEnum } from "@shared/schema";

// Pattern matchers for different types of exercise descriptions
const PATTERN_SETS_REPS = /(\d+)\s*(?:sets?|x)\s*(?:of)?\s*(\d+)\s*(?:reps?|repetitions?)/i;
const PATTERN_SETS_HOLD = /(\d+)\s*(?:sets?|x)\s*(?:of)?\s*(\d+)\s*(?:sec|seconds?)\s*(?:hold|duration)?/i;
const PATTERN_CATEGORY = /(core|lower\s*body|upper\s*body|mobility)/i;
const PATTERN_EQUIPMENT = /(?:equipment|using|with):?\s*([^,.]+)/i;

/**
 * Parses plain text to extract exercise information
 * This is a simple implementation. For production, you'd want a more robust parser.
 */
export function parseExerciseText(text: string): Partial<InsertExercise>[] {
  const exercises: Partial<InsertExercise>[] = [];
  
  // Split by lines or sentences
  const lines = text.split(/[\n\r]+|\.\s+/);
  
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    
    const exercise: Partial<InsertExercise> = {
      name: '',
      category: 'Other',
      type: 'rep',
      sets: 1,
      reps: 10,
      instructions: []
    };
    
    // Try to extract exercise name (first part of line until colon or number)
    const nameMatch = line.match(/^([^:0-9]+)(?:[:|]|(\d+\s*x))/i);
    if (nameMatch) {
      exercise.name = nameMatch[1].trim();
    } else {
      // If no clear pattern, use the whole line as name
      exercise.name = line.trim();
    }
    
    // Extract sets and reps
    const setsRepsMatch = line.match(PATTERN_SETS_REPS);
    if (setsRepsMatch) {
      exercise.type = 'rep';
      exercise.sets = parseInt(setsRepsMatch[1]);
      exercise.reps = parseInt(setsRepsMatch[2]);
    }
    
    // Extract sets and hold duration
    const setsHoldMatch = line.match(PATTERN_SETS_HOLD);
    if (setsHoldMatch) {
      exercise.type = 'hold';
      exercise.sets = parseInt(setsHoldMatch[1]);
      exercise.holdDuration = parseInt(setsHoldMatch[2]);
    }
    
    // Extract category
    const categoryMatch = line.match(PATTERN_CATEGORY);
    if (categoryMatch) {
      const category = categoryMatch[1].toLowerCase();
      if (category.includes('core')) {
        exercise.category = 'Core Stability';
      } else if (category.includes('lower')) {
        exercise.category = 'Lower Body';
      } else if (category.includes('upper')) {
        exercise.category = 'Upper Body';
      } else if (category.includes('mobility')) {
        exercise.category = 'Mobility';
      }
    }
    
    // Extract equipment
    const equipmentMatch = line.match(PATTERN_EQUIPMENT);
    if (equipmentMatch) {
      exercise.equipmentNeeded = equipmentMatch[1].trim();
      exercise.notes = `Equipment: ${exercise.equipmentNeeded}`;
    }
    
    // Default instructions
    exercise.instructions = ["Perform as prescribed by your physical therapist"];
    
    // Only add if we have a name and it seems like a valid exercise
    if (exercise.name.length > 0 && 
        (exercise.sets > 0 || exercise.reps > 0 || exercise.holdDuration > 0)) {
      exercises.push(exercise);
    }
  }
  
  return exercises;
}

/**
 * Validates and prepares exercise data for insertion
 */
export function prepareExerciseForInsertion(partialExercise: Partial<InsertExercise>): InsertExercise {
  // Default values
  const exercise: InsertExercise = {
    name: partialExercise.name || 'Unnamed Exercise',
    category: validateCategory(partialExercise.category),
    type: validateType(partialExercise.type), 
    sets: partialExercise.sets || 1,
    instructions: partialExercise.instructions || ['Perform as prescribed by your physical therapist'],
    reps: partialExercise.type === 'rep' ? (partialExercise.reps || 10) : 0,
    holdDuration: partialExercise.type === 'hold' ? (partialExercise.holdDuration || 10) : 0,
    restTime: partialExercise.restTime || 60,
    notes: partialExercise.notes || '',
    equipmentNeeded: partialExercise.equipmentNeeded || '',
    videoUrl: partialExercise.videoUrl || '',
    isPaired: partialExercise.isPaired || false
  };
  
  return exercise;
}

// Helper functions to validate enum values
function validateCategory(category?: string): 'Core Stability' | 'Lower Body' | 'Upper Body' | 'Mobility' | 'Other' {
  if (!category) return 'Other';
  try {
    return exerciseCategoryEnum.parse(category);
  } catch {
    return 'Other';
  }
}

function validateType(type?: string): 'rep' | 'hold' | 'step' {
  if (!type) return 'rep';
  try {
    return exerciseTypeEnum.parse(type);
  } catch {
    return 'rep';
  }
}
