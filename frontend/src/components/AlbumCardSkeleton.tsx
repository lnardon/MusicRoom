import { Skeleton } from "./ui/skeleton";

export default function AlbumCardSkeleton({ index }: { index: number }) {
  return (
    <div key={index} className="w-full p-1 flex flex-col">
      <Skeleton className="w-full aspect-square rounded-sm mb-2" />
      <Skeleton className="w-3/4 h-4 rounded-sm" />
    </div>
  );
}
