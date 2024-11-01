import { Skeleton } from "@/components/ui/skeleton";

const LaunchDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container">
        <section className="grid grid-cols-3 gap-8 h-[464px] mt-24">
          {/* Left Column - Title and Description */}
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-3/4" /> {/* Title */}
            <Skeleton className="h-1 w-[120px]" /> {/* Brand line */}
            <div className="space-y-3">
              {" "}
              {/* Description */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="flex gap-6 mt-4">
              {" "}
              {/* Social Icons */}
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Middle Column - Image and Progress */}
          <div className="flex flex-col justify-between">
            <Skeleton className="aspect-square rounded-3xl w-full" />{" "}
            {/* Main Image */}
            <div className="space-y-4 mt-4">
              <Skeleton className="h-3 w-full rounded-lg" />{" "}
              {/* Progress Bar */}
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" /> {/* Total minted text */}
                <Skeleton className="h-4 w-32" /> {/* Minted amount */}
              </div>
            </div>
          </div>

          {/* Right Column - Phases */}
          <div className="flex flex-col justify-between h-[464px] gap-8">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-3xl" />{" "}
              {/* Phase Card 1 */}
              <Skeleton className="h-32 w-full rounded-3xl" />{" "}
              {/* Phase Card 2 */}
            </div>
            <Skeleton className="h-10 w-full rounded-lg" /> {/* Button */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LaunchDetailSkeleton;
