import React from "react";
import Image from "next/image";
import { CloseSquare } from "iconsax-react";

interface cardProps {
  image: any;
  title: string;
  onDelete: () => void;
}

const CollectiblePreviewCard: React.FC<cardProps> = ({
  image,
  onDelete,
  title,
}) => {
  return (
    <div className="rounded-[20px] w-[280px] pt-4 pr-4 pb-6 pl-4 backdrop-blur-sm bg-gradient-to-br from-gradientStart to-transparent border border-gray-700 relative mt-4">
      <div className=" w-auto h-full max-w-[248px] max-h-[248px] bg-neutral500 rounded-xl">
        <Image
          src={image}
          alt="collection"
          width={0}
          height={0}
          sizes="100%"
          className="object-contain w-full h-full"
        />
      </div>
      <div className="pt-4 font-medium text-lg2 text-neutral00">{title}</div>

      {/* clear button */}
      <button
        className="absolute flex items-center justify-center w-8 h-8 rounded-xl bg-neutral400 -top-3 -right-3"
        onClick={onDelete}
      >
        <CloseSquare size={16} color="#F8F9FA" />
      </button>
    </div>
  );
};

export default CollectiblePreviewCard;
