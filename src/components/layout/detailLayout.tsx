"use client";

import React, { useEffect } from "react";

const DetailLayout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {}, []);
  return (
    <div className="flex flex-col w-full h-full backdrop-blur-[70px] bg-neutral600 bg-opacity-[70%]  min-h-screen items-center">
      {/* <UseConnectorProvider walletURL={WALLET_URL}> */}
      <div className="w-full max-w-[1216px]">{children}</div>
      {/* </UseConnectorProvider> */}
    </div>
  );
};

export default DetailLayout;

// bg - [url("/slide.png")];
