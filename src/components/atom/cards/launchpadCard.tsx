import React, { useEffect, useState } from "react";
import moment from "moment";
import { Progress } from "@/components/ui/progress";
import { LaunchDataType } from "@/lib/types";
import { s3ImageUrlBuilder } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface LaunchProps {
  data: LaunchDataType;
  id: string;
}

const LaunchpadCard: React.FC<LaunchProps> = ({ data, id }) => {
  const [timeDisplay, setTimeDisplay] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const updateTime = () => {
      if (!data.poEndsAt) {
        setStatus("Indefinite");
        setTimeDisplay("");
        return;
      }

      const now = moment();

      const convertToSeconds = (timestamp: number) => {
        return timestamp.toString().length === 13
          ? Math.floor(timestamp / 1000)
          : timestamp;
      };

      const startMoment = moment.unix(convertToSeconds(data.poStartsAt));
      const endMoment = moment.unix(convertToSeconds(data.poEndsAt));

      if (now.isAfter(endMoment)) {
        setStatus("Ended");
        setTimeDisplay("");
        return;
      }

      if (now.isBetween(startMoment, endMoment)) {
        setStatus("Live");
        const duration = moment.duration(endMoment.diff(now));
        setTimeDisplay(
          `${Math.floor(duration.asDays())}d ${duration.hours().toString().padStart(2, "0")}h ${duration.minutes().toString().padStart(2, "0")}m`,
        );
        return;
      }

      if (now.isBefore(startMoment)) {
        setStatus("Upcoming");
        const duration = moment.duration(startMoment.diff(now));
        setTimeDisplay(
          `${Math.floor(duration.asDays())}d ${duration.hours().toString().padStart(2, "0")}h ${duration.minutes().toString().padStart(2, "0")}m`,
        );
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [data.poStartsAt, data.poEndsAt]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    });
  };

  return (
    <Link href={`/launchpad/${id}`} className="block w-full">
      <div className="relative flex flex-col h-auto min-h-[320px] sm:h-[412px] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-[20px] p-4 text-neutral00 transition-transform hover:scale-[1.02]">
        <div className="relative w-full pb-[100%] sm:pb-0 sm:h-[248px]">
          <Image
            fill
            src={
              data?.logoKey
                ? s3ImageUrlBuilder(data.logoKey)
                : "/launchpads/launch_1.png"
            }
            className="object-cover rounded-xl"
            alt={`${data.name || "Launchpad"} logo`}
          />
        </div>

        <div className="flex-1 w-full text-neutral00">
          <p className="pt-3 pb-3 text-lg sm:text-xl font-bold text-neutral50 line-clamp-2">
            {data?.name}
          </p>
          <div className="flex justify-between py-2 sm:py-3">
            <p className="font-medium text-sm sm:text-md text-neutral100">
              Price
            </p>
            <p className="font-bold text-sm sm:text-md text-neutral50">
              {formatPrice(data.poMintPrice)}
              <span className="ml-1">cBTC</span>
            </p>
          </div>
          <div className="flex h-2 mt-1 border border-white8 rounded-lg border-1">
            <Progress
              value={
                data?.supply > 0 ? (data?.mintedAmount / data?.supply) * 100 : 0
              }
              className={`w-full h-full ${data?.mintedAmount > 0 ? "shadow-shadowBrands" : ""}`}
            />
          </div>
          <p className="pt-2 sm:pt-3 font-bold text-sm sm:text-md text-end">
            {data?.mintedAmount}
            <span className="text-brand"> / </span>
            {data?.supply}
          </p>
        </div>

        <div className="absolute top-6 left-6 flex flex-row gap-2 items-center justify-around w-fit h-[30px] sm:h-[34px] border border-transparent rounded-lg px-3 py-2 bg-neutral500 bg-opacity-[50%] text-sm sm:text-md text-neutral50 font-medium">
          {(status === "Indefinite" || status === "Live") && (
            <div className="bg-success20 h-3 w-3 sm:h-4 sm:w-4 rounded-full flex justify-center items-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full" />
            </div>
          )}
          <p>{status}</p>
        </div>
      </div>
    </Link>
  );
};

export default LaunchpadCard;

// import React, { useEffect, useState } from "react";
// import moment from "moment";
// import { Progress } from "@/components/ui/progress";
// import { LaunchDataType } from "@/lib/types";
// import { s3ImageUrlBuilder } from "@/lib/utils";
// import Image from "next/image";
// import Link from "next/link";

// interface LaunchProps {
//   data: LaunchDataType;
//   id: string;
// }

// const LaunchpadCard: React.FC<LaunchProps> = ({ data, id }) => {
//   const [timeDisplay, setTimeDisplay] = useState("");
//   const [status, setStatus] = useState("");

//   useEffect(() => {
//     const updateTime = () => {
//       // If poEndsAt is undefined, set status to Indefinite
//       if (!data.poEndsAt) {
//         setStatus("Indefinite");
//         setTimeDisplay("");
//         return;
//       }

//       const now = moment();

//       // Convert millisecond timestamps to seconds if needed
//       const convertToSeconds = (timestamp: number) => {
//         return timestamp.toString().length === 13
//           ? Math.floor(timestamp / 1000)
//           : timestamp;
//       };

//       const startMoment = moment.unix(convertToSeconds(data.poStartsAt));
//       const endMoment = moment.unix(convertToSeconds(data.poEndsAt)); // Fixed: was using poStartsAt instead of poEndsAt

//       // Check if ended
//       if (now.isAfter(endMoment)) {
//         setStatus("Ended");
//         setTimeDisplay("");
//         return;
//       }

//       // Check if currently active
//       if (now.isBetween(startMoment, endMoment)) {
//         setStatus("Live");
//         const duration = moment.duration(endMoment.diff(now));
//         setTimeDisplay(
//           `${Math.floor(duration.asDays())}d ${duration.hours().toString().padStart(2, "0")}h ${duration.minutes().toString().padStart(2, "0")}m`
//         );
//         return;
//       }

//       // If not started yet
//       if (now.isBefore(startMoment)) {
//         setStatus("Upcoming");
//         const duration = moment.duration(startMoment.diff(now));
//         setTimeDisplay(
//           `${Math.floor(duration.asDays())}d ${duration.hours().toString().padStart(2, "0")}h ${duration.minutes().toString().padStart(2, "0")}m`
//         );
//       }
//     };

//     updateTime();
//     const interval = setInterval(updateTime, 60000); // Update every minute

//     return () => clearInterval(interval);
//   }, [data.poStartsAt, data.poEndsAt]); // Fixed: removed createdAt from dependencies as it's not used

//   const formatPrice = (price: number) => {
//     const btcAmount = price;
//     return btcAmount.toLocaleString('en-US', {
//       minimumFractionDigits:0,
//       maximumFractionDigits: 6
//     });
//   };
//   return (
//     <Link href={`/launchpad/${id}`}>
//       <div className="relative h-[412px] backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-neutral400 rounded-[20px] px-4 pt-4 flex flex-col text-neutral00">
//         <Image
//           width={248}
//           height={248}
//           src={
//             data?.logoKey
//               ? s3ImageUrlBuilder(data.logoKey)
//               : "/launchpads/launch_1.png"
//           }
//           className="aspect-square rounded-xl"
//           alt={`${data.name || 'Launchpad'} logo`} // Fixed: improved alt text
//         />

//         <div className="text-neutral00">
//           <p className="pt-3 pb-3 text-xl font-bold text-neutral50">
//             {data?.name}
//           </p>
//           <div className="flex justify-between py-3">
//             <p className="font-medium text-neutral100 text-md">Price</p>
//             <p className="font-bold text-md text-neutral50">
//               {formatPrice(data.poMintPrice)} {/* Fixed: added decimal precision */}
//               <span className="ml-1">cBTC</span>
//             </p>
//           </div>
//           <div className="flex h-2 mt-1 border border-white8 rounded-lg border-1">
//             <Progress
//               value={data?.supply > 0 ? (data?.mintedAmount / data?.supply) * 100 : 0}
//               className={`w-full h-full ${data?.mintedAmount > 0 ? "shadow-shadowBrands" : ""}`}
//             />
//           </div>
//           <p className="pt-3 font-bold text-end text-md">
//             {data?.mintedAmount}
//             <span className="text-brand"> / </span>
//             {data?.supply}
//           </p>
//         </div>

//         {/* Status badge */}
//         <div className="flex flex-row gap-2 items-center justify-around w-fit h-[34px] border border-transparent rounded-lg pt-2 pr-3 pb-2 pl-3 absolute top-7 left-8 bg-neutral500 bg-opacity-[50%] text-md text-neutral50 font-medium">
//           {(status === "Indefinite" || status === "Live") && (
//             <div className="bg-success20 h-4 w-4 rounded-full flex justify-center items-center">
//               <div className="w-2 h-2 bg-success rounded-full" />
//             </div>
//           )}
//           <p>{status}</p>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default LaunchpadCard;
