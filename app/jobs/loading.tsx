import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-12 w-full max-w-xl" />
      <Skeleton className="h-[460px] w-full" />
    </div>
  );
}
