import { Skeleton } from "@/components/ui/skeleton";

const ProfileBannerSkeleton = () => {
  return (
    <section className="mt-[43.5px] w-full">
      <div className="relative z-10 h-auto min-h-[216px] w-full rounded-3xl overflow-hidden">
        {/* Banner Background with Blur */}
        <div className="absolute inset-0 bg-neutral500 bg-opacity-[70%]"
          style={{
            backdropFilter: "blur(50px)",
          }}
        />

        {/* Main Content Container */}
        <div className="relative py-12 px-4 sm:px-6 md:px-8 lg:px-12 w-full z-10">
          <div className="flex flex-col md:flex-row gap-6 xl:gap-10 items-center md:items-end">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <Skeleton className="w-24 h-24 md:w-[120px] md:h-[120px] rounded-full" />
            </div>

            {/* Profile Content */}
            <div className="w-full flex flex-col gap-4 md:gap-5">
              {/* Wallet Address and Copy Button */}
              <div className="flex gap-4 items-center justify-center md:justify-start">
                <Skeleton className="w-40 sm:w-48 h-6 sm:h-8" />
                <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded-md" />
              </div>

              {/* Balance and Items Info */}
              <div className="flex flex-col md:flex-row gap-4 justify-between w-full">
                {/* Wallet Balance Section */}
                <div className="rounded-2xl bg-white4 p-3 sm:p-4 flex gap-4 items-center w-full md:w-fit justify-center md:justify-start">
                  <div className="flex flex-row items-center gap-2 md:gap-3">
                    <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" />
                    <Skeleton className="w-24 sm:w-28 h-5 sm:h-6" />
                  </div>
                  <div className="h-6 w-[1px] bg-white16" />
                  <Skeleton className="w-20 sm:w-24 h-5" />
                </div>

                {/* Items Count Section */}
                <div className="grid grid-cols-2 md:flex flex-row md:flex-col lg:flex-row justify-center lg:justify-end gap-4 items-center lg:ml-auto">
                  {/* Total Items */}
                  <div className="py-3 px-4 items-center justify-center flex gap-2 sm:gap-3 rounded-xl bg-white4">
                    <Skeleton className="w-16 sm:w-20 h-4 sm:h-5" />
                    <Skeleton className="w-8 sm:w-10 h-4 sm:h-5" />
                  </div>
                  {/* Listed Items */}
                  <div className="py-3 px-4 items-center justify-center flex gap-2 sm:gap-3 rounded-xl bg-white4">
                    <Skeleton className="w-16 sm:w-20 h-4 sm:h-5" />
                    <Skeleton className="w-8 sm:w-10 h-4 sm:h-5" />
                  </div>
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