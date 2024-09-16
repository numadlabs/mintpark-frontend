import React from "react";
import Image from "next/image";
import { CloseSquare, DocumentText1 } from "iconsax-react";

interface cardProps {
  onDelete: () => void;
  fileSize: number;
  fileName: string;
}

const FileCard: React.FC<cardProps> = ({ onDelete, fileSize, fileName }) => {
  const fileSizeInKB = (fileSize / 1024).toFixed(2);
  return (
    <div className="rounded-[20px] w-[280px] h-[280px] border border-neutral400 relative flex items-center justify-center">
      <div className="flex flex-col items-center justify- gap-4">
        <DocumentText1 size={64} color="#F8F9FA" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-xl text-neutral50 font-medium">{fileName}</p>
          <p className="text-md text-neutral100 font-normal">
            File size: {fileSizeInKB} KB
          </p>
        </div>
      </div>
      <button
        className="rounded-xl bg-neutral400 w-8 h-8 flex items-center justify-center absolute -top-3 -right-3"
        onClick={onDelete}
      >
        <CloseSquare size={16} color="#F8F9FA" />
      </button>
    </div>
  );
};

export default FileCard;
