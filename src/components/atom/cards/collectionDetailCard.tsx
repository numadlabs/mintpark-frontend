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
          <p className="py-1 text-lg2 text-neutral50 font-bold pb-4">
            {data.title}
          </p>
          <div className="relative group h-10 w-[248px] hover:border-hidden border-t border-neutral400">
            <div className="flex justify-between py-4 group-hover:hidden">
              <p className="text-neutral200 font-medium text-md">Price</p>
              <p className="text-neutral50">
                {data.price}
                <span className="ml-1">BTC</span>
              </p>
            </div>
            <div className="group-hover:block hidden text-center transition-opacity cursor-pointer duration-1000 ease-in-out w-[248px] h-10 absolute top-0 left-0 text-white bg-white4 pt-2 pr-5 pb-2 pl-5 rounded-lg">
              Buy now
            </div>
          </div>
        </div>
        {/* <HoverCard /> */}
      </div>
    </>
  );
}
