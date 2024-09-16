import HoverCard from "@/components/section/collections/hoverCard";
import Image from "next/image";

type DetailCard = {
  image: string;
  title: string;
  item: string;
  price: number;
};

export default function ColDetailCard({ data }: { data: DetailCard }) {
  return (
    <>
      <div className="w-[280px] h-[394px] collection backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-gray-700 rounded-xl px-4 pt-4 pb-5 flex flex-col justify-between">
        <Image
          width={248}
          height={248}
          src={data.image}
          className="aspect-square rounded-xl"
          alt="png"
        />

        <div className="pt-1">
          <p className="text-neutral200 font-medium text-md pt-2">
            {data.title}
          </p>
          <p className="py-1 text-lg2 text-neutral50 font-bold border-b border-neutral400 pb-4">
            {data.title}
          </p>
          <div className="flex justify-between py-4">
            <p className="text-neutral200 font-medium text-md">Price</p>
            <p className="text-neutral50">
              {data.price}
              <span className="ml-1">BTC</span>
            </p>
          </div>
        </div>
        {/* <HoverCard /> */}
      </div>
    </>
  );
}
