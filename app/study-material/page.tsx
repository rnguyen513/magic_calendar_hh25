"use client";

import { useState } from "react";
import { experimental_useObject } from "ai/react";
import { questionsSchema } from "@/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";
import { FileUp, Plus, Loader2, BookOpen, Brain, FileText } from "lucide-react";
import { Button } from "@/components/quizzes_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/quizzes_components/ui/card";
import { Progress } from "@/components/quizzes_components/ui/progress";
import Quiz from "@/components/quizzes_components/quiz";
import { generateQuizTitle } from "../quizzes/actions";
import { AnimatePresence, motion } from "framer-motion";

// Define summary schema
const summarySchema = z.object({
  summaryText: z.string(),
  keyPoints: z.array(z.string()),
  title: z.string(),
});

type Summary = z.infer<typeof summarySchema>;

export default function StudyMaterialPage() {
  // Mode state
  const [mode, setMode] = useState<"quiz" | "summary">("quiz");
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>(
    [],
  );
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState<string>();

  // Quiz generation hook
  const {
    submit: submitQuiz,
    object: partialQuestions,
    isLoading: isLoadingQuiz,
  } = experimental_useObject({
    api: "/api/quizzes",
    schema: questionsSchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error("Failed to generate quiz. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      setQuestions(object ?? []);
    },
  });

  // Summary generation hook
  const {
    submit: submitSummary,
    object: partialSummary,
    isLoading: isLoadingSummary,
  } = experimental_useObject({
    api: "/api/summary",
    schema: summarySchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error("Failed to generate summary. Please try again.");
      setFiles([]);
    },
    onFinish: ({ object }) => {
      setSummary(object ?? null);
    },
  });

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
    
    if (mode === "quiz") {
      submitQuiz({ files: encodedFiles });
      if (encodedFiles.length > 0) {
        const generatedTitle = await generateQuizTitle(encodedFiles[0].name);
        setTitle(generatedTitle);
      }
    } else {
      submitSummary({ files: encodedFiles });
    }
  };

  const clearPDF = () => {
    setFiles([]);
    setQuestions([]);
    setSummary(null);
  };

  const isLoading = mode === "quiz" ? isLoadingQuiz : isLoadingSummary;
  const progress = mode === "quiz" 
    ? (partialQuestions ? (partialQuestions.length / 4) * 100 : 0)
    : (partialSummary ? 50 : 0); // Simplified progress for summary

  // Render quiz if we have questions and in quiz mode
  if (mode === "quiz" && questions.length === 4) {
    return (
      <div className="pt-16">
        <div className="flex justify-center gap-4 mb-4">
          <Button 
            onClick={() => { setMode("quiz"); clearPDF(); }}
            variant="default"
            className="w-32"
          >
            <Brain className="mr-2 h-4 w-4" /> Quizzes
          </Button>
          <Button 
            onClick={() => { setMode("summary"); clearPDF(); }}
            variant="outline"
            className="w-32"
          >
            <BookOpen className="mr-2 h-4 w-4" /> Summary
          </Button>
        </div>
        <Quiz title={title ?? "Quiz"} questions={questions} clearPDF={clearPDF} />
      </div>
    );
  }

  // Render summary if we have it and in summary mode
  if (mode === "summary" && summary) {
    return (
      <div className="pt-16 container mx-auto max-w-4xl">
        <div className="flex justify-center gap-4 mb-4">
          <Button 
            onClick={() => { setMode("quiz"); clearPDF(); }}
            variant="outline"
            className="w-32"
          >
            <Brain className="mr-2 h-4 w-4" /> Quizzes
          </Button>
          <Button 
            onClick={() => { setMode("summary"); clearPDF(); }}
            variant="default"
            className="w-32"
          >
            <BookOpen className="mr-2 h-4 w-4" /> Summary
          </Button>
        </div>
        
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
                <FileText className="mr-2 h-4 w-4" /> Try Another PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default view - Upload PDF
  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center pt-16"
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
      <div className="flex justify-center gap-4 mb-4">
        <Button 
          onClick={() => setMode("quiz")}
          variant={mode === "quiz" ? "default" : "outline"}
          className="w-32"
        >
          <Brain className="mr-2 h-4 w-4" /> Quizzes
        </Button>
        <Button 
          onClick={() => setMode("summary")}
          variant={mode === "summary" ? "default" : "outline"}
          className="w-32"
        >
          <BookOpen className="mr-2 h-4 w-4" /> Summary
        </Button>
      </div>
      
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
      
      <Card className="w-full max-w-md h-full border-0 sm:border sm:h-fit mt-4">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="rounded-full bg-primary/10 p-2">
              <FileUp className="h-6 w-6" />
            </div>
            <Plus className="h-4 w-4" />
            <div className="rounded-full bg-primary/10 p-2">
              {mode === "quiz" ? (
                <Brain className="h-6 w-6" />
              ) : (
                <BookOpen className="h-6 w-6" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {mode === "quiz" ? "PDF Quiz Generator" : "PDF Summary Generator"}
            </CardTitle>
            <CardDescription className="text-base">
              Upload a PDF to {mode === "quiz" ? "generate an interactive quiz" : "create a comprehensive summary"} based on its content using Google&apos;s Gemini Pro.
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
                  <span>
                    {mode === "quiz" 
                      ? "Generating Quiz..." 
                      : "Generating Summary..."}
                  </span>
                </span>
              ) : (
                mode === "quiz" ? "Generate Quiz" : "Generate Summary"
              )}
            </Button>
          </form>
          
          {isLoading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {mode === "quiz" 
                    ? "Generating questions..." 
                    : "Creating summary..."}
                </span>
                {mode === "quiz" && partialQuestions && (
                  <span className="text-sm font-medium">
                    {partialQuestions.length || 0}/4
                  </span>
                )}
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 