import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DiscordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function DiscordModal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  className,
}: DiscordModalProps) {
  const maxWidths = {
    sm: "max-w-[440px]",
    md: "max-w-[480px]",
    lg: "max-w-[600px]",
    xl: "max-w-[800px]",
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] sm:rounded-[4px] bg-[#313338] border-none text-white p-0 gap-0 overflow-hidden shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            maxWidths[size],
            className
          )}
        >
          <div className="p-4 pb-3 flex flex-col items-center justify-center flex-shrink-0 relative">
            <DialogPrimitive.Title className="text-xl font-bold text-white text-center">
              {title}
            </DialogPrimitive.Title>
            {subtitle && (
              <DialogPrimitive.Description className="text-sm text-[#B5BAC1] text-center mt-1 font-medium">
                {subtitle}
              </DialogPrimitive.Description>
            )}
            <DialogPrimitive.Close className="absolute right-4 top-4 text-[#80848E] hover:text-[#DBDEE1] transition-colors focus:outline-none">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[50px] max-h-[70vh] custom-scroll">
            {children}
          </div>

          {footer && (
            <div className="bg-[#2B2D31] p-4 flex-shrink-0 flex items-center justify-end gap-3 rounded-b-[4px]">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Custom Discord Inputs
export function DiscordLabel({ children, required, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("block text-xs font-bold text-[#B5BAC1] uppercase tracking-wide mb-2", className)} {...props}>
      {children}
      {required && <span className="text-[#F23F42] ml-1">*</span>}
    </label>
  );
}

export const DiscordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full bg-[#1E1F22] text-[#DBDEE1] border-none rounded-[3px] px-3 py-2.5 outline-none transition-all placeholder:text-[#80848E] focus:ring-1 focus:ring-[#00A8FC]",
        className
      )}
      {...props}
    />
  );
});
DiscordInput.displayName = "DiscordInput";

export const DiscordTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full bg-[#1E1F22] text-[#DBDEE1] border-none rounded-[3px] px-3 py-2.5 outline-none transition-all placeholder:text-[#80848E] focus:ring-1 focus:ring-[#00A8FC] resize-y custom-scroll min-h-[80px]",
        className
      )}
      {...props}
    />
  );
});
DiscordTextarea.displayName = "DiscordTextarea";

export function DiscordField({ label, required, children, helperText, errorText, className }: { label?: string, required?: boolean, children: React.ReactNode, helperText?: string, errorText?: string, className?: string }) {
  return (
    <div className={cn("mb-5", className)}>
      {label && <DiscordLabel required={required}>{label}</DiscordLabel>}
      {children}
      {errorText ? (
        <p className="text-xs text-[#F23F42] mt-1.5 italic font-medium">{errorText}</p>
      ) : helperText ? (
        <p className="text-xs text-[#B5BAC1] mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
}

export function DiscordButton({ children, variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const base = "px-4 py-2.5 rounded-[3px] text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#313338] focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[96px] flex items-center justify-center";
  const variants = {
    primary: "bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5] text-white",
    secondary: "bg-[#4E5058] hover:bg-[#6D6F78] active:bg-[#80848E] text-white",
    danger: "bg-[#DA373C] hover:bg-[#A1282D] active:bg-[#8F2022] text-white",
    ghost: "bg-transparent hover:underline text-white p-0 h-auto min-w-0",
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
