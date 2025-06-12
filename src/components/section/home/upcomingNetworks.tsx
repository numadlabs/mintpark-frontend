import React from "react";
import Image from "next/image";

export const UpcomingNetworks = () => {
  return (
    <>
      <div className="max-w-[1216px] w-full grid gap-8 md:gap-16 px-4 md:px-0">
        <h1 className="font-bold text-center text-neutral00 text-2xl sm:text-3xl md:text-5xl">
          Upcoming network
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-auto gap-4 sm:gap-6 md:gap-8 w-full justify-items-center">
          <div className="w-full max-w-[280px] sm:w-[240px] md:w-[260px] lg:w-[280px] h-[200px] sm:h-[220px] md:h-[240px] flex flex-col gap-6 md:gap-8 items-center justify-center rounded-[24px] md:rounded-[32px] px-6 md:px-8 pt-8 md:pt-12 pb-6 md:pb-8 bg-neutral500/50 border border-[#FFFFFF0A] relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 z-5 rounded-[24px] md:rounded-[32px] scale-100 bg-white/20 opacity-20 blur-sm transition-opacity duration-500 -m-[1px]"></div>
            <div className="relative z-20 flex flex-col gap-6 md:gap-8 items-center justify-center">
              <div className="relative">
                <Image
                  src="/chainLogos/somnia.png"
                  alt="somnia logo"
                  width={80}
                  draggable="false"
                  height={80}
                  className="object-cover w-[80px] h-[80px] md:w-[96px] md:h-[96px] rounded-[16px] md:rounded-[20px] relative z-30"
                />
                {/* Logo glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-white/20 blur-[120px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-[16px] md:rounded-[20px] object-cover bg-white/70 blur-[30px] -z-10"></div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-white transition-colors duration-300 text-center">
                Somnia Testnet
              </h3>
            </div>
          </div>
          <div className="w-full max-w-[280px] sm:w-[240px] md:w-[260px] lg:w-[280px] h-[200px] sm:h-[220px] md:h-[240px] flex flex-col gap-6 md:gap-8 items-center justify-center rounded-[24px] md:rounded-[32px] px-6 md:px-8 pt-8 md:pt-12 pb-6 md:pb-8 bg-neutral500/50 border border-[#FFFFFF0A] relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 z-5 rounded-[24px] md:rounded-[32px] scale-100 bg-white/20 opacity-20 blur-sm transition-opacity duration-500 -m-[1px]"></div>
            <div className="relative z-20 flex flex-col gap-6 md:gap-8 items-center justify-center">
              <div className="relative">
                <Image
                  src="/chainLogos/citrea.png"
                  alt="citrea logo"
                  width={80}
                  draggable="false"
                  height={80}
                  className="object-cover w-[80px] h-[80px] md:w-[96px] md:h-[96px] rounded-[16px] md:rounded-[20px] relative z-30"
                />
                {/* Logo glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-white/20 blur-[120px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-citreaEffect/65 blur-[45px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-[16px] md:rounded-[20px] object-cover bg-white/30 blur-[30px] -z-10"></div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-white transition-colors duration-300 text-center">
                Citrea Mainnet
              </h3>
            </div>
          </div>
          <div className="w-full max-w-[280px] sm:w-[240px] md:w-[260px] lg:w-[280px] h-[200px] sm:h-[220px] md:h-[240px] flex flex-col gap-6 md:gap-8 items-center justify-center rounded-[24px] md:rounded-[32px] px-6 md:px-8 pt-8 md:pt-12 pb-6 md:pb-8 bg-neutral500/50 border border-[#FFFFFF0A] relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 z-5 rounded-[24px] md:rounded-[32px] scale-100 bg-white/20 opacity-20 blur-sm transition-opacity duration-500 -m-[1px]"></div>
            <div className="relative z-20 flex flex-col gap-6 md:gap-8 items-center justify-center">
              <div className="relative">
                <Image
                  src="/chainLogos/botanix.png"
                  alt="botanix logo"
                  width={80}
                  draggable="false"
                  height={80}
                  className="object-cover w-[80px] h-[80px] md:w-[96px] md:h-[96px] rounded-[16px] md:rounded-[20px] relative z-30"
                />
                {/* Logo glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-white/20 blur-[120px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-brand600/65 blur-[35px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-[16px] md:rounded-[20px] object-cover bg-white/30 blur-[30px] -z-10"></div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-white transition-colors duration-300 text-center">
                Botanix
              </h3>
            </div>
          </div>
          <div className="w-full max-w-[280px] sm:w-[240px] md:w-[260px] lg:w-[280px] h-[200px] sm:h-[220px] md:h-[240px] flex flex-col gap-6 md:gap-8 items-center justify-center rounded-[24px] md:rounded-[32px] px-6 md:px-8 pt-8 md:pt-12 pb-6 md:pb-8 bg-neutral500/50 border border-[#FFFFFF0A] relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 z-5 rounded-[24px] md:rounded-[32px] scale-100 bg-white/20 opacity-20 blur-sm transition-opacity duration-500 -m-[1px]"></div>
            <div className="relative z-20 flex flex-col gap-6 md:gap-8 items-center justify-center">
              <div className="relative">
                <Image
                  src="/chainLogos/nubitt.png"
                  alt="Nubit logo"
                  width={80}
                  draggable="false"
                  height={80}
                  className="object-cover w-[80px] h-[80px] md:w-[96px] md:h-[96px] rounded-[16px] md:rounded-[20px] relative z-30"
                />
                {/* Logo glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-white/20 blur-[120px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-nubitEffect/65 blur-[45px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-[16px] md:rounded-[20px] object-cover bg-white/30 blur-[30px] -z-10"></div>
              </div>
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-white transition-colors duration-300 text-center">
                Nubit
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};