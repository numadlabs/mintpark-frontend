"use client";

import React from "react";
import Footer from "./footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col w-full h-full bg-background min-h-screen items-center">
      <div className="w-full max-w-[1216px]">{children}</div>
      <div className="w-full"><Footer/></div>
    </div>
  );
};

export default Layout;
