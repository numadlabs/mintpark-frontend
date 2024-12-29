"use client";

import React from "react";
import Footer from "./footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col w-full h-full bg-background min-h-screen items-center">
      <div className="w-full px-4 md:px-10 2xl:px-28">{children}</div>
      <div className="max-w-[1920px] w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
