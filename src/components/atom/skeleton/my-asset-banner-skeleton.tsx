import { Skeleton } from "@/components/ui/skeleton";

const ProfileBannerSkeleton = () => {
  return (
    <section className="mt-[43.5px]">
      <div className="relative h-[216px] w-full rounded-3xl overflow-hidden">
        {/* Banner background */}
        <div className="absolute inset-0 bg-neutral500 bg-opacity-[70%]" 
          style={{
            backdropFilter: "blur(50px)",
          }}
        />
        
        {/* Content container */}
        <div className="flex relative top-11 pl-12 pr-12 w-full z-50">
          {/* Profile image skeleton */}
          <div className="pt-4">
            <Skeleton className="w-[120px] h-[120px] rounded-full" />
          </div>

          {/* Right side content */}
          <div className="w-full flex flex-col justify-between gap-5 pl-6 pr-6 pt-4 pb-4">
            {/* Wallet address and copy button */}
            <div className="flex gap-4 items-center">
              <Skeleton className="w-[180px] h-7" /> {/* Wallet address */}
              <Skeleton className="w-6 h-6 rounded-md" /> {/* Copy icon */}
            </div>

            {/* Bottom row with balance and stats */}
            <div className="flex justify-between w-full">
              {/* Wallet balance section */}
              <div className="flex gap-4">
                <div className="rounded-2xl bg-white4 p-4 flex gap-4 items-center">
                  <Skeleton className="w-6 h-6 rounded-full" /> {/* Coin icon */}
                  <Skeleton className="w-[120px] h-7" /> {/* Balance */}
                  <div className="border-l border-l-white16 pl-4 h-5">
                    <Skeleton className="w-[80px] h-5" /> {/* USD value */}
                  </div>
                </div>
              </div>

              {/* Stats containers */}
              <div className="flex gap-4 items-end">
                {/* Total items */}
                <div className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl bg-white4 items-center">
                  <Skeleton className="w-[80px] h-5" /> {/* "Total items:" */}
                  <Skeleton className="w-[40px] h-5" /> {/* Count */}
                </div>

                {/* Listed items */}
                <div className="pt-3 pr-4 pb-3 pl-4 flex gap-3 rounded-xl bg-white4 items-center">
                  <Skeleton className="w-[80px] h-5" /> {/* "Listed items:" */}
                  <Skeleton className="w-[40px] h-5" /> {/* Count */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileBannerSkeleton;