"use client";

import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col w-full h-full bg-background min-h-screen items-center pb-[112px]">
      <div className="w-full max-w-[1216px]">{children}</div>
    </div>
  );
};

export default Layout;
