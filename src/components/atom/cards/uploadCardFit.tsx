import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface cardProps {
  image: any;
  index: number;
  onDelete: (index: number) => void;
}

const UploadCardFit: React.FC<cardProps> = ({ image, onDelete, index }) => {
  return (
    <div className="rounded-[20px] w-[280px] h-[280px] border border-neutral400 relative">
      <div className="m-4 w-auto h-full max-w-[248px] max-h-[248px] bg-neutral500 rounded-xl">
        <Image
          src={image}
          alt="collection"
          width={0}
          height={0}
          sizes="100%"
          className="w-full h-full object-contain"
        />
      </div>
      <button
        className="rounded-xl bg-neutral400 w-8 h-8 flex items-center justify-center absolute -top-3 -right-3"
        onClick={() => onDelete(index)}
      >
        <X size={16} color="#F8F9FA" />
      </button>
    </div>
  );
};

export default UploadCardFit;
