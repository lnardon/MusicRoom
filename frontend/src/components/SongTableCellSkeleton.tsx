import { Skeleton } from "./ui/skeleton";

export default function SongTableCellSkeleton({ index }: { index: number }) {
  return (
    <div
    key={index}
    className={`flex flex-row justify-between items-center w-full p-1 rounded-sm mb-1 ${
      index % 2 === 0 ? "bg-[rgba(22,22,22,1)]" : "bg-[rgba(22,22,22,0.42)]"
    }`}
  >
    <div className="flex flex-row items-center">
      <Skeleton className="w-10 h-10 rounded-sm mr-2" />
      <div className="flex-1">
        <Skeleton className="w-48 h-4 rounded-sm mb-2" />
        <Skeleton className="w-32 h-3 rounded-sm" />
      </div>
    </div>
    <Skeleton className="w-12 h-4 rounded-sm" />
  </div>
  );
}
