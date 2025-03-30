"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Folder, Plus, Loader2, BookOpen, Brain, FileText, FolderPlus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/quizzes_components/ui/input";
import { Label } from "@/components/quizzes_components/ui/label";

import { auth } from "@/app/(auth)/auth"

// Define folder type
type Folder = {
  id: string;
  folderName: string;
  createdAt: string;
  userId: string;
};

export default function StudyMaterialPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

    // Async check for session and redirection
    // useEffect(() => {
    //     const checkSession = async () => {
    //       const session = await auth();
    //       if (!session || !session.user) {
    //         router.push("/"); // Redirect to home page if not signed in
    //       } else {
    //         // Set loading state to false once session is verified
    //         setIsLoading(false);
    //       }
    //     };
    
    //     checkSession();
    //   }, [router]);

  // Fetch folders on component mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch("/api/folders");
        if (!response.ok) {
          throw new Error("Failed to fetch folders");
        }
        const data = await response.json();
        setFolders(data.folders);
      } catch (error) {
        console.error("Error fetching folders:", error);
        toast.error("Failed to load folders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, []);

  // Create a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsCreatingFolder(true);

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderName: newFolderName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      const data = await response.json();
      setFolders((prevFolders) => [...prevFolders, data.folder]);
      setNewFolderName("");
      toast.success("Folder created successfully");
      
      // Auto-close the dialog
      setOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder. Please try again.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Delete a folder
  const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation(); // Prevent folder open when clicking delete
    setIsDeleting(folderId);

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete folder");
      }

      setFolders((prevFolders) => prevFolders.filter(folder => folder.id !== folderId));
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle folder click - navigate to folder detail page
  const handleFolderClick = (folderId: string) => {
    router.push(`/study-material/folder/${folderId}`);
  };

  // Format date for display
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
        <p className="mt-4 text-lg">Loading study materials...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Study Materials</h1>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" /> Add Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Enter a name for your new folder to organize your study materials.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="folderName" className="text-right">
                  Folder Name
                </Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter folder name..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateFolder} 
                disabled={isCreatingFolder || !newFolderName.trim()}
              >
                {isCreatingFolder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Folder"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {folders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No folders yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create a folder using the "Add Folder" button above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <Card 
              key={folder.id} 
              className="cursor-pointer transition-all hover:shadow-md relative group"
              onClick={() => handleFolderClick(folder.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <div className="rounded-full bg-primary/10 p-2 mr-3">
                    <Folder className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl truncate" title={folder.folderName}>
                    {folder.folderName}
                  </CardTitle>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => handleDeleteFolder(e, folder.id)}
                  disabled={isDeleting === folder.id}
                >
                  {isDeleting === folder.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created: {formatDate(folder.createdAt)}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleFolderClick(folder.id)}>
                  Open Folder
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 