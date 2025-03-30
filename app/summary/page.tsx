"use client";

import { useState, useEffect } from "react";
import { experimental_useObject } from "ai/react";
import { z } from "zod";
import { toast } from "sonner";
import { FileUp, Plus, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/quizzes_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/quizzes_components/ui/card";
import { Progress } from "@/components/quizzes_components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

// Define summary schema
const summarySchema = z.object({
  summaryText: z.string(),
  keyPoints: z.array(z.string()),
  title: z.string(),
});

type Summary = z.infer<typeof summarySchema>;

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = searchParams.get("documentId");
  
  const [files, setFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [attemptedGeneration, setAttemptedGeneration] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [documentFolderId, setDocumentFolderId] = useState<string | null>(null);

  const {
    submit,
    object: partialSummary,
    isLoading,
  } = experimental_useObject({
    api: documentId ? `/api/summary?documentId=${documentId}` : "/api/summary",
    schema: summarySchema,
    initialValue: undefined,
    onError: (error) => {
      console.error("Summary generation error:", error);
      toast.error("Failed to generate summary. Please try again with another document.");
      setFiles([]);
      setGenerationError(true);
      
      // Clear the URL parameter to prevent infinite retries
      if (documentId) {
        // Redirect back to folder if we know which folder it came from
        if (documentFolderId) {
          router.replace(`/study-material/folder/${documentFolderId}`);
        } else {
          router.replace("/summary");
        }
      }
    },
    onFinish: ({ object }) => {
      setSummary(object ?? null);
    },
  });

  // Effect to auto-trigger summary generation if documentId is provided
  useEffect(() => {
    let isActive = true; // Flag to track if component is still mounted
    
    if (documentId && !attemptedGeneration && !generationError) {
      // Mark that we've attempted generation with this document ID
      setAttemptedGeneration(true);
      
      // If we have a documentId, directly call the summary API with documentId in the body
      submit({ documentId });
      
      // Try to fetch document info and get folder information
      const fetchDocumentInfo = async () => {
        try {
          if (!isActive) return; // Don't proceed if component unmounted
          
          const response = await fetch(`/api/documents/${documentId}`);
          if (!isActive) return; // Don't proceed if component unmounted
          
          if (response.ok) {
            const data = await response.json();
            if (!isActive) return; // Don't proceed if component unmounted
            
            console.log("Document data received:", data); // Log for debugging
            
            if (data.document && data.document.folderId) {
              console.log("Setting folder ID from document:", data.document.folderId);
              setDocumentFolderId(data.document.folderId);
            }
          } else {
            // If we can't fetch the document, redirect back to summary page
            if (isActive) {
              toast.error("Could not find document. Please try again.");
              router.replace("/summary");
            }
          }
        } catch (error) {
          if (isActive) {
            console.error("Error fetching document info:", error);
            toast.error("Error retrieving document details.");
            router.replace("/summary");
          }
        }
      };
      
      fetchDocumentInfo();
    }
    
    // Cleanup function
    return () => {
      isActive = false; // Prevent state updates if component unmounts
    };
  }, [documentId, submit, attemptedGeneration, generationError, router]);

  // Reset attempt tracking when documentId changes
  useEffect(() => {
    if (!documentId) {
      setAttemptedGeneration(false);
      setGenerationError(false);
    }
  }, [documentId]);

  // When component mounts, check if we have a document ID in the URL and try to fetch folder info
  useEffect(() => {
    if (documentId) {
      // Try to fetch document info to get folder ID even before generation
      const fetchInitialFolderInfo = async () => {
        try {
          const response = await fetch(`/api/documents/${documentId}`);
          if (response.ok) {
            const data = await response.json();
            console.log("Initial document folder check:", data);
            if (data.document && data.document.folderId) {
              console.log("Setting initial folder ID:", data.document.folderId);
              setDocumentFolderId(data.document.folderId);
            }
          }
        } catch (error) {
          console.error("Error in initial folder info fetch:", error);
        }
      };
      
      fetchInitialFolderInfo();
    }
  }, [documentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker.",
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files under 5MB are allowed.");
    }

    setFiles(validFiles);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error("Please upload a PDF file first");
      return;
    }
    
    const encodedFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await encodeFileAsBase64(file),
      })),
    );
    
    submit({ files: encodedFiles });
  };

  const clearPDF = () => {
    setFiles([]);
    setSummary(null);
    
    // If we know which folder this document came from, redirect back to it
    if (documentFolderId) {
      router.push(`/study-material/folder/${documentFolderId}`);
    } else {
      // If we don't have a folder ID, go to the study material page
      router.push('/study-material');
    }
  };

  // If we have a summary, render it
  if (summary) {
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
                onClick={clearPDF}
                className="bg-primary hover:bg-primary/90 w-full max-w-md"
              >
                <BookOpen className="mr-2 h-4 w-4" /> Try Another PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we're processing a document from the URL, show a different loading state
  if (documentId && isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center pt-16">
        <Card className="w-full max-w-md border p-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Generating Summary
            </CardTitle>
            <CardDescription>
              Creating a detailed summary of your document...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={partialSummary ? 50 : 0} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center pt-16"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => setIsDragging(false)}
      onDragEnd={() => setIsDragging(false)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange({
          target: { files: e.dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Drag and drop files here</div>
            <div className="text-sm dark:text-zinc-400 text-zinc-500">
              {"(PDFs only)"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit mt-12">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="rounded-full bg-primary/10 p-2">
              <FileUp className="h-6 w-6" />
            </div>
            <Plus className="h-4 w-4" />
            <div className="rounded-full bg-primary/10 p-2">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              PDF Summary Generator
            </CardTitle>
            <CardDescription className="text-base">
              Upload a PDF to create a comprehensive summary based on its content using Google&apos;s Gemini Pro.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithFiles} className="space-y-4">
            <div
              className={`relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {files.length > 0 ? (
                  <span className="font-medium text-foreground">
                    {files[0].name}
                  </span>
                ) : (
                  <span>Drop your PDF here or click to browse.</span>
                )}
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={files.length === 0 || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Summary...</span>
                </span>
              ) : (
                "Generate Summary"
              )}
            </Button>
          </form>
          {isLoading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Creating summary...
                </span>
              </div>
              <Progress value={partialSummary ? 50 : 0} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 