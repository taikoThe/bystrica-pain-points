"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onOpenChange, title, description, children }: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] rounded-t-xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        {title ? (
          <SheetHeader className="px-4 pb-4">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        ) : (
          <VisuallyHidden>
            <SheetTitle>Panel</SheetTitle>
          </VisuallyHidden>
        )}
        <div className="overflow-y-auto px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
