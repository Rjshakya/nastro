import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "text-xl font-medium tracking-tighter font-bold",
        className,
      )}
    >
      <p>Nastro</p>
    </div>
  );
};
