import Image from "next/image";
import { CollectionDataType } from "@/lib/types";
import { ordinalsImageCDN, s3ImageUrlBuilder } from "@/lib/utils";

export default function ColDetailCards({ data }: { data: CollectionDataType }) {
  return (
    <>
      <section className="flex w-full justify-between items-center bg-neutral500 bg-opacity-[50%] hover:bg-neutral400 hover:bg-opacity-[30%]   rounded-2xl pt-4 pb-4 pl-4">
        <div className="flex w-[392px] h-16 gap-5">
          <Image
            width={64}
            height={64}
            src={data.fileKey ? s3ImageUrlBuilder(data.fileKey) : ordinalsImageCDN(data.uniqueIdx)}
            className="aspect-square rounded-lg"
            alt="png"
          />
          <p className="text-neutral50 font-medium text-xl flex items-center">
            {data.name}
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
              {(data.floorDifference ?? 0) >= 0 ? '+' : ''}{data.floorDifference ?? 0}%
            </p>
          </div>
          <div className="w-full max-w-[200px] h-[18px]">
            <p className="font-medium text-lg2 text-neutral50">{data.ownedBy === null ? "-" : data.ownedBy}</p>
          </div>
          <div className="w-full max-w-[200px] h-[18px] group">
            <span className="font-medium text-lg2 text-neutral50 relative">
              <span className="group-hover:hidden">{data.createdAt} days ago</span>
              <span className="hidden group-hover:block transition-opacity cursor-pointer duration-1000 ease-in-out w-[103px] h-10 absolute -top-2 -left-[60px] text-white bg-white4 pt-2 pr-5 pb-2 pl-5 rounded-lg">
                Buy now
              </span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
