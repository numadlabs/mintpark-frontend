import { Gallery } from "iconsax-react";
import React from "react";

interface cardProps {
  icon: any;
  title: string;
  description: string;
  handleNav: () => void;
}

const CollectionTypeCard: React.FC<cardProps> = ({
  icon: Icon,
  title,
  description,
  handleNav,
}) => {
  return (
    <button
      className="flex flex-row gap-4 bg-white4 p-4 rounded-2xl w-full items-center cursor-pointer border border-gray50 hover:border-brand transition-all duration-300 ease-in-out"
      onClick={handleNav}
    >
      <div className="bg-white8 h-10 w-10 rounded-lg flex justify-center items-center">
        <Icon size={24} color="#D7D8D8" />
      </div>
      <div className="flex flex-col gap-2 text-start justify-start items-start">
        <p className="text-lg text-neutral50 font-bold">{title}</p>
        <p className="text-md text-neutral100 ">{description}</p>
      </div>
    </button>
  );
};

export default CollectionTypeCard;
