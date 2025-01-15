import React from "react";
import { X } from "lucide-react";
import { DocumentText1 } from "iconsax-react";

interface cardProps {
  title: string;
  size: string;
  onDelete: () => void;
}

const UploadJsonCard: React.FC<cardProps> = ({ title, size, onDelete }) => {
  return (
    <div className="rounded-[20px] w-[280px] h-[280px] border border-neutral400 relative">
      <div className="flex justify-center items-center w-full h-full">
        <div className="flex flex-col justify-center items-center gap-4">
          <DocumentText1 size={64} color="#D7D8D8" />
          <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-neutral50 text-xl font-medium">{title}</p>
            <p className="text-md text-neutral200">{size}</p>
          </div>
        </div>
      </div>
      <button
        className="rounded-xl bg-neutral400 w-8 h-8 flex items-center justify-center absolute -top-3 -right-3"
        onClick={onDelete}
      >
        <X size={16} color="#F8F9FA" />
      </button>
    </div>
  );
};

export default UploadJsonCard;
