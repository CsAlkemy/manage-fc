import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogTitle, 
  DialogHeader 
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
}

interface ResponsiveModalTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface ResponsiveModalContentProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveModal({ children, open, onOpenChange }: ResponsiveModalProps) {
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
      {children}
    </Dialog>
  );
}

function ResponsiveModalTrigger({ children, asChild }: ResponsiveModalTriggerProps) {
  return (
    <DialogTrigger asChild={asChild}>
      {children}
    </DialogTrigger>
  );
}

function ResponsiveModalContent({ children, className }: ResponsiveModalContentProps) {
  return (
    <DialogContent 
      className={`max-w-2xl max-h-[90vh] overflow-y-auto z-50 ${className || ""}`}
      onPointerDownOutside={(e) => {
        // Ensure clicking outside closes the modal
        e.preventDefault();
      }}
    >
      {children}
    </DialogContent>
  );
}

function ResponsiveModalHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogHeader className={className} {...props}>
      {children}
    </DialogHeader>
  );
}

function ResponsiveModalTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  );
}

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
}; 