import React from "react";
import Image from "next/image";

export type NftCard = {
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

export default function CollectionNftCard({ data }: { data: NftCard }) {
  return (
    <>
      <div className="">
        <Image
          width={248}
          height={248}
          src={data.image}
          className="aspect-square rounded-xl"
          alt="png"
        />
      </div>
    </>
  );
}
