import React from "react";
import Image from "next/image";
import Link from "next/link";
// import { CardType } from "./collectionCard";

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

export default function ColumColCard({ data }: { data: CardType }) {
  return (
    <>
      <Link
        href={`/collections/${data.id}`}
        className="flex justify-around items-center collection bg-neutral500 bg-opacity-[50%] hover:bg-neutral400 hover:bg-opacity-[30%]  rounded-2xl pt-4 pr-8 pb-4 pl-4"
      >
        <div className="flex w-[376px] h-16 gap-5">
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
        <div className="w-[468px] h-[42px] flex justify-around items-center">
          <div className="text-right items-center">
            <p className="font-medium text-lg2 text-neutral50">
              {data.price}
              <span className="ml-1">BTC</span>
            </p>
            <span className="font-medium text-md text-neutral200">$332</span>
          </div>
          <div className="text-right">
            <p className="font-medium text-lg2 text-neutral50">
              {data.volume}
              <span className="ml-1">BTC</span>
            </p>
            <span className="font-medium text-md text-neutral200">$78.4k</span>
          </div>
          <div className="text-right">
            <p className="font-medium text-lg2 text-neutral50">
              {data.market}
              <span className="ml-1">BTC</span>
            </p>
            <span className="font-medium text-md text-neutral200">$218.1k</span>
          </div>
        </div>
        <div className="w-[324px] h-5 flex justify-around">
          <span className="font-medium text-lg2 text-neutral50">
            {data.sales}
          </span>
          <span className="font-medium text-lg2 text-neutral50">
            {data.listed}
          </span>
          <span className="font-medium text-lg2 text-neutral50">
            <span>{data.owner}k</span>
          </span>
        </div>
      </Link>
    </>
  );
}
