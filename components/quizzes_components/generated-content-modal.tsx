import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, BookOpen, Brain, Calendar, RefreshCw } from "lucide-react";

// Define the type for generated content
type GeneratedContent = {
  id: string;
  contentType: string;
  content: any;
  createdAt: string;
  documentId: string;
};

interface GeneratedContentModalProps {
  documentId: string;
  documentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GeneratedContentModal({
  documentId,
  documentName,
  open,
  onOpenChange
}: GeneratedContentModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch the generated content when the modal opens
  useEffect(() => {
    if (open) {
      fetchGeneratedContent();
    }
  }, [open, documentId]);

  const fetchGeneratedContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/generated-content?documentId=${documentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch generated content");
      }
      
      const data = await response.json();
      setContent(data.generatedContent);
    } catch (error) {
      console.error("Error fetching generated content:", error);
      setError("Failed to load content history. Please try again.");
      toast.error("Failed to load content history");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh content without showing full loading state
  const refreshContent = async () => {
    setIsRefreshing(true);
    
    try {
      const response = await fetch(`/api/generated-content?documentId=${documentId}`);
      if (!response.ok) {
        throw new Error("Failed to refresh content");
      }
      
      const data = await response.json();
      setContent(data.generatedContent);
    } catch (error) {
      console.error("Error refreshing content:", error);
      toast.error("Failed to refresh content");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewContent = (contentItem: GeneratedContent) => {
    // Close the modal
    onOpenChange(false);
    
    // Navigate to the appropriate page based on content type
    if (contentItem.contentType === 'quiz') {
      // Navigate to quiz page with the saved quiz
      router.push(`/quizzes/saved/${contentItem.id}`);
    } else if (contentItem.contentType === 'summary') {
      // Navigate to summary page with the saved summary
      router.push(`/summary/saved/${contentItem.id}`);
    }
  };

  // Group content by type
  const quizzes = content.filter(item => item.contentType === 'quiz');
  const summaries = content.filter(item => item.contentType === 'summary');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle>Document Content History</DialogTitle>
          <DialogDescription>
            View previously generated quizzes and summaries for {documentName}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading content history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={fetchGeneratedContent} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No generated content found for this document.</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {quizzes.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Brain className="mr-2 h-4 w-4" /> Quizzes
                </h3>
                <div className="space-y-2">
                  {quizzes.map((quiz) => (
                    <div 
                      key={quiz.id} 
                      className="flex justify-between items-center p-3 border rounded-md hover:bg-secondary/50 cursor-pointer"
                      onClick={() => handleViewContent(quiz)}
                    >
                      <div>
                        <p className="font-medium">Quiz</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {formatDate(quiz.createdAt)}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {summaries.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" /> Summaries
                </h3>
                <div className="space-y-2">
                  {summaries.map((summary) => (
                    <div 
                      key={summary.id} 
                      className="flex justify-between items-center p-3 border rounded-md hover:bg-secondary/50 cursor-pointer"
                      onClick={() => handleViewContent(summary)}
                    >
                      <div>
                        <p className="font-medium">Summary</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {formatDate(summary.createdAt)}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 