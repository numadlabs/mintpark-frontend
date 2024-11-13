import React, { useState } from "react";
import Image from "next/image";

interface itemProps {
  title: string;
  handleNav: () => void;
}

const HeaderItem: React.FC<itemProps> = ({ title, handleNav }) => {
  const [showDiv, setShowDiv] = useState(false);

  return (
    <div
      className="h-full overflow-hidden w-auto flex justify-center"
      onClick={handleNav}
    >
      {/* <span className="absolute h-[100px] w-48 bg-background z-50 top-[91.8px]"></span> */}
      <div
        className="py-2 px-4 relative flex justify-center cursor-pointer hover:text-brand h-full items-center"
        onMouseEnter={() => setShowDiv(true)}
        onMouseLeave={() => setShowDiv(false)}
      >
        <p
          className={`${title === "Create" ? "text-neutral200" : "text-neutral00"} ${title === "Create" ? "" : "hover:text-brand"} text-md`}
        >
          {title}
        </p>
      </div>
    </div>
  );
};

export default HeaderItem;
