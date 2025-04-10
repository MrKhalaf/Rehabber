import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parseExerciseText, prepareExerciseForInsertion } from '@/lib/parse-exercise';
import { useParsePTNotes, useCreateExercise } from '@/hooks/use-exercises';
import { exerciseCategoryEnum, exerciseTypeEnum, exerciseInsertSchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Upload, Plus } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Form validation schema for custom exercise
const customExerciseSchema = exerciseInsertSchema.extend({
  instructions: z.string().transform(val => val.split('\n').filter(line => line.trim().length > 0) as string[])
});

// Simple schema for PT notes upload
const ptNotesSchema = z.object({
  notes: z.string().min(1, "Please enter your physical therapist's notes"),
});

export default function AddExercise() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createExercise = useCreateExercise();
  const parsePTNotes = useParsePTNotes();
  const [parsedExercises, setParsedExercises] = useState<any[]>([]);

  // Form for custom exercise
  const customForm = useForm<z.infer<typeof customExerciseSchema>>({
    resolver: zodResolver(customExerciseSchema),
    defaultValues: {
      name: '',
      category: 'Other',
      type: 'rep',
      sets: 3,
      reps: 10,
      holdDuration: 0,
      restTime: 60,
      instructions: '',
      isPaired: false
    },
  });

  // Form for PT notes
  const ptNotesForm = useForm<z.infer<typeof ptNotesSchema>>({
    resolver: zodResolver(ptNotesSchema),
    defaultValues: {
      notes: '',
    },
  });

  const handleBack = () => {
    setLocation('/');
  };

  const onSubmitCustom = (data: z.infer<typeof customExerciseSchema>) => {
    // Prepare data based on exercise type
    if (data.type === 'hold') {
      data.reps = 0; // Clear reps for hold exercises
    } else if (data.type === 'rep') {
      data.holdDuration = 0; // Clear holdDuration for rep exercises
    }

    createExercise.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Exercise Created",
          description: "Your custom exercise has been created successfully.",
        });
        setLocation('/');
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to create exercise: " + error.message,
          variant: "destructive",
        });
      }
    });
  };

  const onSubmitPTNotes = (data: z.infer<typeof ptNotesSchema>) => {
    // Call the backend PT notes parser
    parsePTNotes.mutate(data.notes, {
      onSuccess: (result) => {
        if (result.exercises && result.exercises.length > 0) {
          setParsedExercises(result.exercises);
          toast({
            title: "Exercises Parsed",
            description: `Found ${result.exercises.length} exercises in your PT notes.`,
          });
        } else {
          toast({
            title: "No Exercises Found",
            description: "Couldn't detect any exercises in your notes. Try adding some manually.",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        // Fallback to client-side parsing if the server fails
        const parsed = parseExerciseText(data.notes);
        if (parsed.length > 0) {
          setParsedExercises(parsed);
          toast({
            title: "Exercises Parsed (Local)",
            description: `Found ${parsed.length} exercises in your PT notes.`,
          });
        } else {
          toast({
            title: "No Exercises Found",
            description: "Couldn't detect any exercises in your notes. Try adding some manually.",
            variant: "destructive",
          });
        }
      }
    });
  };

  const addParsedExercise = (exercise: any) => {
    const preparedExercise = prepareExerciseForInsertion(exercise);
    
    createExercise.mutate(preparedExercise, {
      onSuccess: () => {
        toast({
          title: "Exercise Added",
          description: `Added "${preparedExercise.name}" to your exercises.`,
        });
        // Remove from parsed list
        setParsedExercises(prev => prev.filter(e => e.name !== exercise.name));
      }
    });
  };

  return (
    <div className="h-screen flex flex-col bg-light text-dark">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pb-6">
          {/* Header */}
          <div className="bg-primary text-white p-4 pt-12 relative">
            <button 
              className="absolute top-12 left-4 p-1 rounded-full bg-white/20"
              onClick={handleBack}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-center mt-2">
              <h1 className="text-xl font-bold">Add New Exercise</h1>
              <p className="text-white/80 mt-1">From PT Notes or Custom</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6">
            <Tabs defaultValue="pt-notes">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="pt-notes" className="flex-1">PT Notes</TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">Custom Exercise</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pt-notes">
                {/* PT Notes Upload Section */}
                <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-medium">Upload PT Notes</h2>
                      <p className="text-sm text-gray-500">We'll parse your therapist's instructions</p>
                    </div>
                  </div>
                  
                  <Form {...ptNotesForm}>
                    <form onSubmit={ptNotesForm.handleSubmit(onSubmitPTNotes)} className="space-y-4">
                      <FormField
                        control={ptNotesForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Physical Therapist Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Paste your therapist's notes here... e.g. 'Bird Dog: 3x10 reps, Plank: 3x30 sec hold'"
                                className="min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={parsePTNotes.isPending}
                      >
                        {parsePTNotes.isPending ? 'Parsing...' : 'Parse Notes'}
                      </Button>
                    </form>
                  </Form>
                </div>
                
                {/* Parsed Exercises */}
                {parsedExercises.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="font-medium mb-4">Parsed Exercises</h2>
                    <div className="space-y-3">
                      {parsedExercises.map((exercise, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{exercise.name}</h3>
                              <p className="text-sm text-gray-500">
                                {exercise.type === 'hold' ? 
                                  `${exercise.sets} sets × ${exercise.holdDuration} sec hold` : 
                                  `${exercise.sets} sets × ${exercise.reps} reps`}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => addParsedExercise(exercise)}
                              disabled={createExercise.isPending}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="custom">
                {/* Custom Exercise Form */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-medium">Create Custom Exercise</h2>
                      <p className="text-sm text-gray-500">Build your own recovery routine</p>
                    </div>
                  </div>
                  
                  <Form {...customForm}>
                    <form onSubmit={customForm.handleSubmit(onSubmitCustom)} className="space-y-4">
                      <FormField
                        control={customForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exercise Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Standing Calf Raises" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={customForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(exerciseCategoryEnum.enum).map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={customForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exercise Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="rep">Repetitions</SelectItem>
                                <SelectItem value="hold">Timed Hold</SelectItem>
                                <SelectItem value="step">Step-by-Step</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={customForm.control}
                          name="sets"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sets</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g., 3" 
                                  {...field}
                                  onChange={e => {
                                    if (e.target.value === '') {
                                      field.onChange('');
                                    } else {
                                      field.onChange(parseInt(e.target.value) || 1);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {customForm.watch('type') === 'rep' ? (
                          <FormField
                            control={customForm.control}
                            name="reps"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Repetitions</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 10" 
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <FormField
                            control={customForm.control}
                            name="holdDuration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hold Duration (sec)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 30" 
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      
                      <FormField
                        control={customForm.control}
                        name="restTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rest Time (sec)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 60" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 30)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={customForm.control}
                        name="isPaired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 mt-1"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Paired Exercise (Left/Right)</FormLabel>
                              <p className="text-sm text-gray-500">
                                Check this if the exercise needs to be performed on both sides
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={customForm.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter each instruction on a new line..."
                                className="min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createExercise.isPending}
                      >
                        {createExercise.isPending ? 'Creating...' : 'Create Exercise'}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
