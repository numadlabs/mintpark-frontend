"use client";

import React from "react";
import Footer from "./footer";
import Header from "./header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col w-full h-full bg-background min-h-screen items-center">
      <div className="w-full sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 md2:px-[112px] 3xl:px-10">
          <Header />
        </div>
      </div>
      
      <div className="w-full max-w-[1920px] px-4 md2:px-[112px] 3xl:px-10">
        {children}
      </div>
      
      <div className="max-w-[1920px] w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
