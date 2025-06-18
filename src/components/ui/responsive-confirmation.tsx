import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResponsiveConfirmationProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "destructive";
}

export function ResponsiveConfirmation({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default"
}: ResponsiveConfirmationProps) {
  // Ensure the modal state is properly controlled
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  }, [isControlled, onOpenChange]);

  const handleConfirm = () => {
    onConfirm();
    handleOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    handleOpenChange(false);
  };

  // Force close on unmount to prevent stuck overlays
  React.useEffect(() => {
    return () => {
      if (isOpen) {
        handleOpenChange(false);
      }
    };
  }, []);

  // Global escape key handler as fallback
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleOpenChange]);

  // Force cleanup of any stuck overlays
  React.useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure proper cleanup
      const timer = setTimeout(() => {
        const overlays = document.querySelectorAll('[data-radix-popper-content-wrapper], [data-state="open"]');
        overlays.forEach(overlay => {
          if (overlay.getAttribute('data-state') === 'closed') {
            overlay.remove();
          }
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog key={isOpen ? "open" : "closed"} open={isOpen} onOpenChange={handleOpenChange} modal>
      <DialogContent 
        className="max-w-md z-50"
        onPointerDownOutside={(e) => {
          // Ensure clicking outside closes the modal
          e.preventDefault();
        }}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            className="flex-1 sm:flex-none"
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}