import React from "react";
import { DocumentUpload } from "iconsax-react";

interface FileProps {
  text: string;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadFile: React.FC<FileProps> = ({
  text,
  handleImageUpload,
}) => {
  return (
    <div className="border border-dashed border-neutral400 w-full rounded-3xl h-[280px] justify-center items-center flex cursor-pointer">
      <label className="w-full flex items-center justify-center flex-col gap-4 cursor-pointer">
        <DocumentUpload size={64} color={"#b0b0b1"} />
        <div className="flex flex-col gap-2 items-center">
          <p className="text-xl text-neutral50 font-medium">
            Click to browse or drag a file here
          </p>
          <p className="text-md text-neutral200">{text}</p>
        </div>
        <input
          type="file"
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </label>
    </div>
  );
};

export default UploadFile;
