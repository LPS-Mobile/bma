import { Loader2, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export const Spinner = ({ className, ...props }: LucideProps) => {
  return (
    <Loader2 
      className={cn("h-4 w-4 animate-spin text-primary", className)} 
      {...props} 
    />
  );
};