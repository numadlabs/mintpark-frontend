import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { fetchLaunchs } from "@/lib/service/queryHelper";
import { CollectionType } from "@/lib/types";
import { s3ImageUrlBuilder } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
}

export default function LaunchpadCard({ collection }: { collection: any }) {
  const { data: launchs = [] } = useQuery({
    queryKey: ["launchData"],
    queryFn: () => fetchLaunchs(),
  });
  console.log("launchcards", launchs);
  // const [countdown, setCountdown] = useState<CountdownTime>({
  //   days: 0,
  //   hours: 0,
  //   minutes: 0,
  // });

  // useEffect(() => {
  //   const calculateCountdown = () => {
  //     const now = new Date();
  //     const startDate = new Date(collection.POStartDate);
  //     const difference = startDate.getTime() - now.getTime();

  //     if (difference > 0) {
  //       const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  //       const hours = Math.floor(
  //         (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  //       );
  //       const minutes = Math.floor(
  //         (difference % (1000 * 60 * 60)) / (1000 * 60),
  //       );

  //       setCountdown({ days, hours, minutes });
  //     } else {
  //       setCountdown({ days: 0, hours: 0, minutes: 0 });
  //     }
  //   };
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const startDate = new Date(collection.POStartDate);
      const difference = startDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );

        setCountdown({ days, hours, minutes });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 60000); // Update every minute

    const calculatedPercentage = (collection.totalCount / collection.mintedCount ) * 100;
    setPercentage(Math.min(Math.max(calculatedPercentage, 0), 100)); // Ensure percentage is between 0 and 100

    return () => clearInterval(timer);
  }, [collection.POStartDate, collection.mintedCount, collection.totalCount]);

  //   calculateCountdown();
  //   const timer = setInterval(calculateCountdown, 60000); // Update every minute
  //   const percentage = (collection.mintedCount / collection.totalCount) * 100;
  //   return () => clearInterval(timer);
  // }, [collection.POStartDate]);
  return (
    <Link href={`/launchpad/${collection?.id}`}>
      <div className="h-[412px] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-gray-700 rounded-[20px] px-4 pt-4 flex flex-col text-neutral00">
        <Image
          width={248}
          height={248}
          src={
            collection?.logoKey
              ? s3ImageUrlBuilder(collection.logoKey)
              : "/launchpads/launch_1.png"
          }
          className="aspect-square rounded-xl"
          alt="png"
        />

        <div className="text-neutral00">
          <p className="pt-3 pb-3 text-xl font-bold text-neutral50">
            {collection?.name}
          </p>
          <div className="flex justify-between py-3">
            <p className="font-medium text-neutral100 text-md">Price</p>
            <p className="font-bold text-md text-neutral50">
              {collection?.price / 10 ** 8}
              <span className="ml-1">BTC</span>
            </p>
          </div>
          <div className="flex h-2 mt-1 border border-gray-400 rounded-lg border-1">
            <Progress
              value={percentage}
              className="bg-brand shadow-shadowBrands h-full w-0"
            />
          </div>
          <p className="pt-3 font-bold text-end text-md">
            {collection?.mintedCount}
            <span className="text-brand"> / </span>
            {collection?.totalCount}
          </p>
        </div>
        <div
          className="flex justify-around w-[129px] h-[34px] border border-transparent rounded-lg pt-2 pr-3 pb-2 pl-3 absolute top-7 left-8 bg-neutral500 bg-opacity-[50%] text-md text-neutral50 font-medium"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          <Image
            width={16}
            height={16}
            src="/launchpads/active.png"
            className="mr-1"
            alt="active"
          />
          <p>
            {countdown.days}
            <span className="pr-1">d</span>
          </p>
          <p>
            {countdown.hours}
            <span className="pr-1">h</span>
          </p>
          <p>
            {countdown.minutes}
            <span className="pr-1">m</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

// import { Progress } from "@/components/ui/progress";
// import { fetchLaunchs } from "@/lib/service/queryHelper";
// import { CollectionType } from "@/lib/types";
// import { s3ImageUrlBuilder } from "@/lib/utils";
// import { useQuery } from "@tanstack/react-query";
// import Image from "next/image";
// import Link from "next/link";

// export default function LaunchpadCard({
//   collection,
// }: {
//   collection: CollectionType;
// }) {
//   const LaunchCard = () => {
//     const { data: launchs = [] } = useQuery({
//       queryKey: ["launchData"],
//       queryFn: () => fetchLaunchs(),
//     });
//   };
//   return (
//     <>
//       <Link href={`/launchpad/${collection?.id}`}>
//         <div className="h-[412px] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-gray-700 rounded-[20px] px-4 pt-4 flex flex-col text-neutral00">
//           {/* todo endpoint deer file key avah */}
//           <Image
//             width={248}
//             height={248}
//             src={
//               collection?.logoKey
//                 ? s3ImageUrlBuilder(collection.logoKey)
//                 : "/launchpads/launch_2.png"
//             }
//             className="aspect-square rounded-xl"
//             alt="png"
//           />

//           <div className="text-neutral00">
//             <p className="pt-3 pb-3 text-xl font-bold text-neutral50">
//               {collection?.name}
//             </p>
//             <div className="flex justify-between py-3">
//               <p className="font-medium text-neutral100 text-md">Price</p>
//               {/* <p>{collection.time.day}</p> */}
//               <p className="font-bold text-md text-neutral50">
//                 {collection?.price / 10 ** 8}
//                 <span className="ml-1">BTC</span>
//               </p>
//             </div>
//             <div className="flex h-2 mt-1 border border-gray-400 rounded-lg border-1">
//               <Progress
//                 value={3}
//                 className="bg-brand shadow-shadowBrands h-full w-[90%]"
//               />
//             </div>
//             <p className="pt-3 font-bold text-end text-md">
//               {/* {collection.mint} */}
//               {collection?.mintedCount}
//               <span className="text-brand"> /</span> {/* {collection.total} */}
//               {collection?.totalCount}
//             </p>
//           </div>
//           <div
//             className="flex justify-around w-[129px] h-[34px] border border-transparent rounded-lg pt-2 pr-3 pb-2 pl-3 absolute top-7 left-8 bg-neutral500 bg-opacity-[50%] text-md text-neutral50 font-medium"
//             style={{
//               backdropFilter: "blur(10px)",
//             }}
//           >
//             {/* todo end date haruulah bilu */}{" "}
//             <Image
//               width={16}
//               height={16}
//               src="/launchpads/active.png"
//               className="mr-1"
//               alt="active"
//             />
//             <p>
//               {/* {collection.time.day} `*/} 1<span className="pr-1">d</span>
//             </p>
//             <p>
//               {/* {collection.time.hour} */} 2<span className="pr-1">h</span>
//             </p>
//             <p>
//               {/* {collection.time.minute} */} 3<span className="pr-1">m</span>
//             </p>
//           </div>
//           {/* <HoverCard /> */}
//           {/* <div className="hidden hover:block">
//             <div className="flex flex-col hover:block absolute right-8 -top-1 gap-[10px] pt-8">
//               <span className="h-10 w-10 border border-transparent rounded-lg p-2 bg-neutral500 bg-opacity-[50%]">
//                 <Image
//                   width={24}
//                   height={24}
//                   src="/detail_icon/icon_1.png"
//                   className="aspect-square rounded-3xl"
//                   alt="png"
//                 />
//               </span>
//               <span className="h-10 w-10 border border-transparent rounded-lg p-2 bg-neutral500 bg-opacity-[50%]">
//                 <Image
//                   width={24}
//                   height={24}
//                   src="/detail_icon/icon_2.png"
//                   className="aspect-square rounded-3xl"
//                   alt="png"
//                 />
//               </span>
//               <span className="h-10 w-10 border border-transparent rounded-lg p-2 bg-neutral500 bg-opacity-[50%]">
//                 <Image
//                   width={24}
//                   height={24}
//                   src="/detail_icon/icon_3.png"
//                   className="aspect-square rounded-3xl"
//                   alt="png"
//                 />
//               </span>
//             </div>
//           </div> */}
//         </div>
//       </Link>
//     </>
//   );
// }
