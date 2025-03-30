"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/quizzes_components/ui/button";
import Quiz from "@/components/quizzes_components/quiz";
import { questionsSchema } from "@/lib/schemas";
import { z } from "zod";

export default function SavedQuizPage({ params }: { params: { contentId: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>([]);
  const [title, setTitle] = useState("Saved Quiz");
  const [folderId, setFolderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedQuiz = async () => {
      try {
        const response = await fetch(`/api/generated-content/${params.contentId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch saved quiz");
        }
        
        const data = await response.json();
        
        if (data.contentItem.contentType !== "quiz") {
          throw new Error("Content is not a quiz");
        }
        
        // Parse the content
        const content = typeof data.contentItem.content === 'string' 
          ? JSON.parse(data.contentItem.content) 
          : data.contentItem.content;
          
        // Validate content against schema
        const parseResult = questionsSchema.safeParse(content);
        if (!parseResult.success) {
          throw new Error("Invalid quiz format");
        }
        
        setQuestions(parseResult.data);
        
        // Get document info to set title and folder ID
        if (data.documentInfo) {
          setTitle(`Quiz on ${data.documentInfo.fileName}`);
          setFolderId(data.documentInfo.folderId);
        }
      } catch (error) {
        console.error("Error fetching saved quiz:", error);
        setError("Failed to load the saved quiz. Please try again.");
        toast.error("Failed to load saved quiz");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedQuiz();
  }, [params.contentId]);

  const clearPDF = () => {
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
        <p className="mt-4 text-lg">Loading saved quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="mb-8">{error}</p>
          <Button onClick={() => router.push("/study-material")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">No Quiz Found</h1>
          <p className="mb-8">This quiz could not be loaded or does not exist.</p>
          <Button onClick={() => router.push("/study-material")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Button>
        </div>
      </div>
    );
  }

  return <Quiz title={title} questions={questions} clearPDF={clearPDF} />;
} 