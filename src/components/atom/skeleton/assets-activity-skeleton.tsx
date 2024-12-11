import { Skeleton } from "@/components/ui/skeleton";


const AssetsActivitySkeleton = () => {
  return (
   <>
     <div className="flex flex-col gap-3 pt-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-row items-center justify-between p-3 bg-gray50 rounded-2xl"
                >
                  <div className="flex flex-row items-center gap-3 max-w-[360px] w-full">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                  <div className="max-w-[220px] w-full">
                    <Skeleton className="w-24 h-[34px] rounded-lg" />
                  </div>
                  <div className="max-w-[200px] w-full flex flex-col gap-1">
                    <Skeleton className="w-20 h-5" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  <div className="max-w-[260px] w-full gap-2 flex flex-row items-center">
                    <Skeleton className="w-24 h-5" />
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-24 h-5" />
                  </div>
                  <div className="max-w-[152px] w-full">
                    <Skeleton className="w-16 h-5" />
                  </div>
                </div>
              ))}
            </div>
   </>
  );
};

export default AssetsActivitySkeleton;
