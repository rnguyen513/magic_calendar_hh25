"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/quizzes_components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/quizzes_components/ui/card";
import { z } from "zod";

// Define summary schema
const summarySchema = z.object({
  summaryText: z.string(),
  keyPoints: z.array(z.string()),
  title: z.string(),
});

type Summary = z.infer<typeof summarySchema>;

export default function SavedSummaryPage({ params }: { params: { contentId: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedSummary = async () => {
      try {
        const response = await fetch(`/api/generated-content/${params.contentId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch saved summary");
        }
        
        const data = await response.json();
        
        if (data.contentItem.contentType !== "summary") {
          throw new Error("Content is not a summary");
        }
        
        // Parse the content
        const content = typeof data.contentItem.content === 'string' 
          ? JSON.parse(data.contentItem.content) 
          : data.contentItem.content;
          
        // Validate content against schema
        const parseResult = summarySchema.safeParse(content);
        if (!parseResult.success) {
          throw new Error("Invalid summary format");
        }
        
        setSummary(parseResult.data);
        
        // Get document info to set folder ID
        if (data.documentInfo) {
          setFolderId(data.documentInfo.folderId);
        }
      } catch (error) {
        console.error("Error fetching saved summary:", error);
        setError("Failed to load the saved summary. Please try again.");
        toast.error("Failed to load saved summary");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedSummary();
  }, [params.contentId]);

  const handleBackClick = () => {
    if (folderId) {
      router.push(`/study-material/folder/${folderId}`);
    } else {
      router.push("/study-material");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading saved summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="mb-8">{error}</p>
          <Button onClick={handleBackClick}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">No Summary Found</h1>
          <p className="mb-8">This summary could not be loaded or does not exist.</p>
          <Button onClick={handleBackClick}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 container mx-auto max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{summary.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose dark:prose-invert">
            <h3 className="text-lg font-semibold">Summary</h3>
            <p className="whitespace-pre-line">{summary.summaryText}</p>
            
            <h3 className="text-lg font-semibold mt-6">Key Points</h3>
            <ul>
              {summary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleBackClick}
              className="bg-primary hover:bg-primary/90 w-full max-w-md"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Study Materials
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 