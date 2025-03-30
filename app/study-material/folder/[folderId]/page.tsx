"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  FileUp, 
  ChevronLeft, 
  Folder, 
  File, 
  Loader2, 
  BookOpen, 
  Brain,
  MoreHorizontal,
  Plus
} from "lucide-react";
import { Button } from "@/components/quizzes_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/quizzes_components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/quizzes_components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/quizzes_components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "@/components/quizzes_components/ui/progress";

// Define types for folder and document
type Folder = {
  id: string;
  folderName: string;
  createdAt: string;
  userId: string;
};

type Document = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  blobUrl: string;
  createdAt: string;
  folderId: string;
  userId: string;
};

export default function FolderDetailPage({ params }: { params: { folderId: string } }) {
  const router = useRouter();
  const { folderId } = params;
  
  const [folder, setFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeMode, setActiveMode] = useState<'quiz' | 'summary'>('quiz');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Fetch folder details and documents
  useEffect(() => {
    const fetchFolderDetails = async () => {
      try {
        const response = await fetch(`/api/folders/${folderId}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Folder not found");
            router.push("/study-material");
            return;
          }
          throw new Error("Failed to fetch folder details");
        }
        
        const data = await response.json();
        setFolder(data.folder);
        setDocuments(data.documents);
      } catch (error) {
        console.error("Error fetching folder details:", error);
        toast.error("Failed to load folder details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolderDetails();
  }, [folderId, router]);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        "Safari does not support drag & drop. Please use the file picker.",
      );
      return;
    }

    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file is a PDF
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds the 5MB limit");
      return;
    }
    
    setSelectedFile(file);
  };

  // Handle file upload
  const handleFileUpload = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // Upload file to the folder
      const response = await fetch(`/api/folders/${folderId}/documents`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error("A file with this name already exists in the folder");
        } else {
          throw new Error(errorData.error || "Failed to upload document");
        }
        return;
      }
      
      const data = await response.json();
      setDocuments((prevDocuments) => [...prevDocuments, data.document]);
      toast.success("Document uploaded successfully");

      // Reset selected file
      setSelectedFile(null);
      
      // Store the document information for reference
      const documentData = data.document;
      
      // Redirect to appropriate page based on active mode with a slight delay to allow UI updates
      if (documentData && activeMode) {
        try {
          setTimeout(() => {
            if (activeMode === 'quiz') {
              router.push(`/quizzes?documentId=${documentData.id}`);
            } else {
              router.push(`/summary?documentId=${documentData.id}`);
            }
          }, 500);
        } catch (error) {
          console.error("Error during redirection:", error);
          toast.error("Error navigating to generation page. Please try accessing it from your documents list.");
        }
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Navigate to document viewer
  const handleViewDocument = (blobUrl: string) => {
    window.open(blobUrl, '_blank');
  };

  // Format bytes to human-readable size
  const formatFileSize = (bytes: string) => {
    const bytesNum = parseInt(bytes, 10);
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytesNum === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytesNum) / Math.log(1024)).toString(), 10);
    return Math.round((bytesNum / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading folder contents...</p>
      </div>
    );
  }

  // If folder not found (should not happen due to redirect in useEffect)
  if (!folder) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Folder Not Found</h1>
          <Button onClick={() => router.push("/study-material")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Study Materials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="flex items-center mb-8">
        <Button 
          variant="outline" 
          onClick={() => router.push("/study-material")}
          className="mr-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <Folder className="mr-3 h-7 w-7" />
          {folder.folderName}
        </h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Created: {formatDate(folder.createdAt)}
        </p>
      </div>

      {/* Mode selector */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <Button 
          variant={activeMode === 'quiz' ? 'default' : 'outline'} 
          size="lg"
          className="w-32"
          onClick={() => setActiveMode('quiz')}
        >
          <Brain className="mr-2 h-5 w-5" /> Quizzes
        </Button>
        <Button 
          variant={activeMode === 'summary' ? 'default' : 'outline'} 
          size="lg"
          className="w-32"
          onClick={() => setActiveMode('summary')}
        >
          <BookOpen className="mr-2 h-5 w-5" /> Summary
        </Button>
      </div>

      <div 
        className="w-full"
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
              <FileUp className="h-10 w-10 text-muted-foreground" />
              <div>Drop your PDF here</div>
              <div className="text-sm dark:text-zinc-400 text-zinc-500">
                (PDFs only)
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content card */}
        <Card className="w-full max-w-md mx-auto mb-8">
          <CardHeader className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
              <div className="rounded-full bg-primary/10 p-2">
                <FileUp className="h-6 w-6" />
              </div>
              <Plus className="h-4 w-4" />
              <div className="rounded-full bg-primary/10 p-2">
                {activeMode === "quiz" ? (
                  <Brain className="h-6 w-6" />
                ) : (
                  <BookOpen className="h-6 w-6" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                PDF {activeMode === "quiz" ? "Quiz" : "Summary"} Generator
              </CardTitle>
              <CardDescription className="text-base">
                Upload a PDF to {activeMode === "quiz" ? "generate an interactive quiz" : "create a comprehensive summary"} based on its content using Google's Gemini Pro.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-muted-foreground/50"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  {selectedFile ? (
                    <span className="font-medium text-foreground">
                      {selectedFile.name}
                    </span>
                  ) : (
                    <span>Drop your PDF here or click to browse.</span>
                  )}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </span>
                ) : (
                  <span>Upload & Generate {activeMode === "quiz" ? "Quiz" : "Summary"}</span>
                )}
              </Button>
            </form>
            
            {isUploading && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Uploading document...
                  </span>
                </div>
                <Progress value={50} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents list */}
        {documents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Your Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <Card key={document.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="rounded-full bg-primary/10 p-2 mr-3">
                          <File className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg truncate" title={document.fileName}>
                          {document.fileName}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDocument(document.blobUrl)}>
                            View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/quizzes?documentId=${document.id}`)}>
                            Generate Quiz
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/summary?documentId=${document.id}`)}>
                            Generate Summary
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Size: {formatFileSize(document.fileSize)}</span>
                      <span>Added: {formatDate(document.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 