import Image from "next/image";
import { CardType } from "./collectionCard";

// type ColumnDetailCard = {
//   image: string;
//   title: string;
//   price: number;
//   floor: number;
//   owner: string;
//   day: number;
// };

export default function ColDetailCards({ data }: { data: CardType }) {
  return (
    <>
      <section className="flex w-full justify-between items-center bg-neutral500 bg-opacity-[50%] hover:bg-neutral400 hover:bg-opacity-[30%]   rounded-2xl pt-4 pb-4 pl-4">
        <div className="flex w-[392px] h-16 gap-5">
          <Image
            width={64}
            height={64}
            src={data.image}
            className="aspect-square rounded-lg"
            alt="png"
          />
          <p className="text-neutral50 font-medium text-xl flex items-center">
            {data.title}
          </p>
        </div>
        <div className="grid grid-cols-4 w-full text-center">
          <div className="w-full max-w-[200px] h-[18px]">
            <p className="font-medium text-lg2 text-neutral50">
              {data.price}
              <span className="ml-1">BTC</span>
            </p>
          </div>
          <div className="w-full max-w-[200px] h-[18px]">
            <p className="font-medium text-lg2 text-neutral700">
              +{data.floor}%
            </p>
          </div>
          <div className="w-full max-w-[200px] h-[18px]">
            <p className="font-medium text-lg2 text-neutral50">{data.owner}</p>
          </div>
          <div className="w-full max-w-[200px] h-[18px]">
            <span className="font-medium text-lg2 text-neutral50">
              <span>{data.day} days ago</span>
              <span></span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
