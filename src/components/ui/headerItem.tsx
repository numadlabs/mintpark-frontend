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
        <p className={"text-neutral00 hover:text-brand"}>{title}</p>
      </div>
      {/* {showDiv && (
        <div
          className={`blur-[28px] bg-[#D3F85A] transition delay-300 duration-300 ease-in-out absolute top-20 w-10 h-10`}
        />
      )} */}
    </div>
  );
};

export default HeaderItem;
