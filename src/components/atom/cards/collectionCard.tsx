import Image from "next/image";
// import { Progress } from "@/components/ui/progress";
import HoverCard from "@/components/section/collections/hoverCard";
import { Notepad, Profile2User } from "iconsax-react";
import Link from "next/link";

export type CardType = {
  id: number;
  image: string;
  type: string;
  title: string;
  price: number;
  owner: number;
  item: string;
  floor: number;
  day: number;
  volume: number;
  items: number;
  market: number;
  sales: number;
  listed?: number;
};

export default function CollectionCard({ data }: { data: CardType }) {
  return (
    <Link
      href={`/collections/${data.id}`}
      className="backdrop-blur-sm bg-gradient-to-br collection mt-4 from-gradientStart to-transparent border border-gray-700 rounded-xl pl-4 pr-4 pt-4 pb-5 flex flex-col justify-between"
    >
      <Image
        width={248}
        height={248}
        src={data.image}
        className="aspect-square rounded-xl"
        alt="png"
      />
      <div className="pt-1 pl-1 ">
        <p className="py-3 text-xl font-bold text-neutral00">{data.title}</p>
        <div className="flex justify-around relative right-6 gap-2 py-2">
          <div>
            {" "}
            <p className="text-sm font-medium text-neutral200 gap-2">
              Floor price
            </p>
            <p className="pt-2 font-bold text-md text-neutral-50">
              {data.price}
              <span className="ml-1">BTC</span>
            </p>
          </div>
          <div>
            {" "}
            <p className="text-sm font-medium text-neutral200 gap-2">Volume</p>
            <p className="pt-2 font-bold text-md text-neutral-50">
              {data.price}
              <span className="ml-1">BTC</span>
            </p>
          </div>
        </div>
        <div className="border border-neutral400 mb-4 mt-4"></div>
        <div className="flex justify-around relative right-[12px]">
          <div className="flex mt-2">
            <Profile2User color="#d3f85a" className="w-4 h-4" />
            <p className="ml-2 font-medium text-md text-neutral50">
              <span>{data.owner}</span> owners
            </p>
          </div>
          <div className="flex mt-2">
            <Notepad color="#d3f85a" className="w-4 h-4" />
            <p className="ml-2 font-medium text-md text-neutral50">
              <span>{data.items}k</span> items
            </p>
          </div>
        </div>
      </div>
      <HoverCard />
    </Link>
  );
}
`1`;
