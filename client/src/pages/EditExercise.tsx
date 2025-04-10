import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExercise, useUpdateExercise } from '@/hooks/use-exercises';
import { exerciseCategoryEnum, exerciseTypeEnum, exerciseInsertSchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Trash } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Form validation schema for editing exercise
const editExerciseSchema = exerciseInsertSchema.extend({
  instructions: z.string().transform(val => val.split('\n').filter(line => line.trim().length > 0)),
  category: exerciseCategoryEnum,
  type: exerciseTypeEnum
});

export default function EditExercise() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [match, params] = useRoute('/edit-exercise/:id');
  const exerciseId = match ? parseInt(params.id) : null;
  const { data: exercise, isLoading, isError } = useExercise(exerciseId);
  const updateExercise = useUpdateExercise();

  // Form for editing exercise
  const form = useForm<z.infer<typeof editExerciseSchema>>({
    resolver: zodResolver(editExerciseSchema),
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

  // Populate form with exercise data when it loads
  useEffect(() => {
    if (exercise) {
      form.reset({
        name: exercise.name,
        category: exercise.category,
        type: exercise.type,
        sets: exercise.sets,
        reps: exercise.reps || 0,
        holdDuration: exercise.holdDuration || 0,
        restTime: exercise.restTime || 60,
        isPaired: exercise.isPaired || false,
        // Convert array to multiline string for textarea
        instructions: exercise.instructions ? exercise.instructions.join('\n') : '',
        notes: exercise.notes || '',
        equipmentNeeded: exercise.equipmentNeeded || '',
        videoUrl: exercise.videoUrl || ''
      });
    }
  }, [exercise, form]);

  const handleBack = () => {
    if (exercise) {
      setLocation(`/exercise/${exercise.id}`);
    } else {
      setLocation('/');
    }
  };

  const onSubmit = (data: z.infer<typeof editExerciseSchema>) => {
    // Prepare data based on exercise type
    if (data.type === 'hold') {
      data.reps = 0; // Clear reps for hold exercises
    } else if (data.type === 'rep') {
      data.holdDuration = 0; // Clear holdDuration for rep exercises
    }

    if (exerciseId) {
      updateExercise.mutate(
        { 
          id: exerciseId, 
          data 
        }, 
        {
          onSuccess: () => {
            toast({
              title: "Exercise Updated",
              description: "Your exercise has been updated successfully.",
            });
            setLocation(`/exercise/${exerciseId}`);
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: "Failed to update exercise: " + error.message,
              variant: "destructive",
            });
          }
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="h-8 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !exercise) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Exercise Not Found</h2>
          <p className="text-gray-600 mb-4">The exercise you're trying to edit doesn't exist or couldn't be loaded.</p>
          <Button onClick={() => setLocation('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold">Edit Exercise</h1>
              <p className="text-white/80 mt-1">{exercise.name}</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-4 py-6">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
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
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
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
                      control={form.control}
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
                                // Allow empty value during editing
                                if (e.target.value === '') {
                                  field.onChange('');
                                } else {
                                  field.onChange(parseInt(e.target.value) || 1);
                                }
                              }}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('type') === 'rep' ? (
                      <FormField
                        control={form.control}
                        name="reps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repetitions</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 10" 
                                {...field}
                                onChange={e => {
                                  if (e.target.value === '') {
                                    field.onChange('');
                                  } else {
                                    field.onChange(parseInt(e.target.value) || 0);
                                  }
                                }}
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="holdDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hold Duration (sec)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 30" 
                                {...field}
                                onChange={e => {
                                  if (e.target.value === '') {
                                    field.onChange('');
                                  } else {
                                    field.onChange(parseInt(e.target.value) || 0);
                                  }
                                }}
                                value={field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="restTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rest Time (sec)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 60" 
                              {...field}
                              onChange={e => {
                                if (e.target.value === '') {
                                  field.onChange('');
                                } else {
                                  field.onChange(parseInt(e.target.value) || 0);
                                }
                              }}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isPaired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 p-3 border rounded-md">
                          <FormLabel>Two Sides (Left/Right)</FormLabel>
                          <FormControl>
                            <Switch 
                              checked={field.value === true} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="equipmentNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Needed</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Resistance band, chair"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., https://youtube.com/watch?v=..."
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter each instruction step on a new line"
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
                    disabled={updateExercise.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateExercise.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}