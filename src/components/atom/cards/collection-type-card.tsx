import React from "react";
import { IconProps } from "iconsax-react";

interface cardProps {
  icon: React.FC<IconProps>;
  title: string;
  description: string;
  onClick: () => void;
  isSelected: boolean;
}

const CollectionTypeCard: React.FC<cardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  isSelected,
}) => {
  return (
    <button
      className={`flex flex-row gap-4 bg-white4 p-4 rounded-2xl w-full items-center cursor-pointer border border-neutral500 hover:border-brand
                   focus:border-brand transition-all duration-300 ease-in-out transform
        ${isSelected ? "border-brand" : "border-neutral500"}`}
      onClick={onClick}
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
