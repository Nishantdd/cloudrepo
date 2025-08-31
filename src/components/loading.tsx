import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 w-full h-[calc(100vh-4rem)]">
      <Loader2 height={24} width={24} className="animate-spin-slow" />
      Getting your details
    </div>
  );
}
