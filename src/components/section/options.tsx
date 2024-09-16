import React from "react";

interface optionsProps {
  id: number;
  icon: any;
  title: string;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

const Options: React.FC<optionsProps> = ({
  id,
  icon: Icon,
  title,
  text,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={`p-8 flex flex-row items-center gap-6 border rounded-3xl w-full cursor-pointer hover:border-brand
                   focus:border-brand ${
                     isSelected ? "border-brand" : "border-neutral500"
                   }`}
      onClick={onClick}
    >
      <Icon size={40} color={isSelected ? "#D3F85A" : "#F8F9FA"} />
      <div className="flex flex-col gap-2">
        <p className="text-2xl text-neutral50 font-bold">{title}</p>
        <p className="text-lg2 text-neutral100 font-normal">{text}</p>
      </div>
    </div>
  );
};

export default Options;
