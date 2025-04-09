import { useState } from 'react';
import { X, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { parseExerciseFromText, parsePtNotesFromServer, convertToInsertExercises } from '@/lib/exercise-parser';
import { useToast } from '@/hooks/use-toast';

interface UploadNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessNotes: (exercises: any[]) => void; // Will be typed better in a real app
}

export function UploadNotesModal({ isOpen, onClose, onProcessNotes }: UploadNotesModalProps) {
  const [noteText, setNoteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle file upload - in a real app would process PDFs etc.
    // For this demo we just handle text files
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setNoteText(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Unsupported file type",
        description: "Please upload a text file",
        variant: "destructive"
      });
    }
  };

  const handleProcessNotes = async () => {
    if (!noteText.trim()) {
      toast({
        title: "Empty content",
        description: "Please enter physical therapy notes",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Try server-side parsing first, fallback to client-side
      const parsedExercises = await parsePtNotesFromServer(noteText);
      
      if (parsedExercises.length > 0) {
        // Convert to proper exercise format
        const exercises = convertToInsertExercises(parsedExercises, 0, 1);
        onProcessNotes(exercises);
        onClose();
        toast({
          title: "Notes processed successfully",
          description: `Found ${parsedExercises.length} exercises`,
        });
      } else {
        toast({
          title: "No exercises found",
          description: "Unable to find exercise information in the notes",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing notes:', error);
      toast({
        title: "Error processing notes",
        description: "Please check your input and try again",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <header className="px-4 py-3 border-b border-secondary-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Upload PT Notes</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-secondary-500" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </header>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <Label className="block text-sm font-medium text-secondary-700 mb-1">Select Files</Label>
            <label className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:bg-secondary-50 transition-colors cursor-pointer block">
              <CloudUpload className="h-6 w-6 text-secondary-400 mx-auto mb-2" />
              <p className="text-sm text-secondary-600 mb-1">Drag and drop files here or click to browse</p>
              <p className="text-xs text-secondary-500">Supports PDF, JPG, PNG, TXT</p>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.txt"
              />
            </label>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-secondary-700 mb-1">Or paste text directly</Label>
            <Textarea 
              className="w-full border border-secondary-300 rounded-lg p-3 h-32 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Paste your PT instructions here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-blue-800 mb-1">How it works</h4>
            <p className="text-xs text-blue-700">
              The app will analyze your physical therapist's notes to extract exercises, sets, reps, and hold durations. 
              You can review and edit the extracted information before adding it to your routine.
            </p>
          </div>
        </div>
        
        <footer className="px-4 py-3 border-t border-secondary-200">
          <Button 
            className="w-full py-2"
            onClick={handleProcessNotes}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Process Notes'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
