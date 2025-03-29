"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { useModal } from "@/providers/modal-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

interface CustomModalProps {
  title?: string;
  subheading?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  contentClass?: string;
  id?: string;
  customizedModal?: boolean;
}

export default function CustomModal({
  title,
  subheading,
  children,
  defaultOpen = false,
  contentClass,
  id = "default",
  customizedModal = false,
}: CustomModalProps) {
  const { isOpen, setClose, setOpen, canClose, setCanClose } = useModal();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  const contentClassName = clsx("overflow-auto rounded-md bg-card", contentClass);

  useEffect(() => {
    setLocalOpen(isOpen[id] ?? defaultOpen);
  }, [isOpen[id], id, defaultOpen]);

  useEffect(() => {
    if (localOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [localOpen]);

  function handleOpenChange(open: boolean) {
    if (!open && canClose[id] === false) {
      setShowConfirmation(true);
    } else {
      setLocalOpen(open);
      if (!open) {
        setTimeout(() => setClose(id), 300);
      } else {
        setOpen(
          <CustomModal id={id} title={title} subheading={subheading} contentClass={contentClass} customizedModal={customizedModal}>
            {children}
          </CustomModal>,
          undefined,
          id
        );
      }
    }
  }

  function handleConfirmClose() {
    setShowConfirmation(false);
    setCanClose(id, true);
    setLocalOpen(false);
    setTimeout(() => setClose(id), 300);
  }

  return (
    <>
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to close?</AlertDialogTitle>
            <AlertDialogDescription>This action will close the current modal. Any unsaved changes may be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Modal */}
      {customizedModal ? (
        <AnimatePresence>
          {localOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-md"
              onClick={() => handleOpenChange(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={clsx(
                  "relative p-4 md:p-6 rounded-lg shadow-lg bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto",
                  contentClassName
                )}
                onClick={(e) => e.stopPropagation()}
                ref={contentRef}
                tabIndex={-1}
              >
                {/* Close Button */}
                <button
                  className="absolute top-3 right-3 p-1 rounded-full transition-colors hover:bg-gray-200"
                  onClick={() => handleOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Title & Subheading */}
                {title && <h2 className="text-2xl font-semibold mb-2">{title}</h2>}
                {subheading && <p className="text-gray-500 mb-4">{subheading}</p>}

                {/* Modal Content */}
                <div className="flex flex-col flex-grow">{children}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <Dialog open={localOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              {subheading && <DialogDescription>{subheading}</DialogDescription>}
              <div className="pt-2 flex flex-col flex-grow">{children}</div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
