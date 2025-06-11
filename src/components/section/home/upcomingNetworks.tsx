import React from "react";
import Image from "next/image";

export const UpcomingNetworks = () => {
  return (
    <>
      <div className="max-w-[1216px] w-full grid gap-16">
        <h1 className="font-bold text-center text-neutral00 text-3xl md:text-5xl">
          Upcoming network
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mx-auto gap-8">
          <div className="w-[280px] h-[240px] flex flex-col gap-8 items-center justify-center rounded-[32px] px-8 pt-12 pb-8 bg-neutral500/50 border border-[#FFFFFF0A] relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 z-5 rounded-[32px] scale-100 bg-white/20 opacity-20 blur-sm transition-opacity duration-500 -m-[1px]"></div>
            <div className="relative z-20 flex flex-col gap-8 items-center justify-center">
              <div className="relative">
                <Image
                  src="/chainLogos/somnia.png"
                  alt="somnia logo"
                  width={96}
                  draggable="false"
                  height={96}
                  className="object-cover w-[96px] h-[96px] rounded-[20px] relative z-30"
                />
                {/* Logo glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-white/20 blur-[120px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-[20px] object-cover bg-white/70 blur-[30px] -z-10"></div>
              </div>
              <h3 className="font-bold text-2xl text-white transition-colors duration-300">
                Somnia Testnet
              </h3>
            </div>
          </div>
          <div className="w-[280px] h-[240px] flex flex-col gap-8 items-center justify-center rounded-[32px] px-8 pt-12 pb-8 bg-neutral500/50 border border-[#FFFFFF0A] relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 z-5 rounded-[32px] scale-100 bg-white/20 opacity-20 blur-sm transition-opacity duration-500 -m-[1px]"></div>
            <div className="relative z-20 flex flex-col gap-8 items-center justify-center">
              <div className="relative">
                <Image
                  src="/chainLogos/citrea.png"
                  alt="citrea logo"
                  width={96}
                  draggable="false"
                  height={96}
                  className="object-cover w-[96px] h-[96px] rounded-[20px] relative z-30"
                />
                {/* Logo glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-white/20 blur-[120px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-citreaEffect/65 blur-[45px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-[20px] object-cover bg-white/30 blur-[30px] -z-10"></div>
              </div>
              <h3 className="font-bold text-2xl text-white transition-colors duration-300">
                Citrea Mainnet
              </h3>
            </div>
          </div>
          <div className="w-[280px] h-[240px] flex flex-col gap-8 items-center justify-center rounded-[32px] px-8 pt-12 pb-8 bg-neutral500/50 border border-[#FFFFFF0A] relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 z-5 rounded-[32px] scale-100 bg-white/20 opacity-20 blur-sm transition-opacity duration-500 -m-[1px]"></div>
            <div className="relative z-20 flex flex-col gap-8 items-center justify-center">
              <div className="relative">
                <Image
                  src="/chainLogos/botanix.png"
                  alt="botanix logo"
                  width={96}
                  draggable="false"
                  height={96}
                  className="object-cover w-[96px] h-[96px] rounded-[20px] relative z-30"
                />
                {/* Logo glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-white/20 blur-[120px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-brand600/65 blur-[35px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-[20px] object-cover bg-white/30 blur-[30px] -z-10"></div>
              </div>
              <h3 className="font-bold text-2xl text-white transition-colors duration-300">
                Botanix
              </h3>
            </div>
          </div>
          <div className="w-[280px] h-[240px] flex flex-col gap-8 items-center justify-center rounded-[32px] px-8 pt-12 pb-8 bg-neutral500/50 border border-[#FFFFFF0A] relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 z-5 rounded-[32px] scale-100 bg-white/20 opacity-20 blur-sm transition-opacity duration-500 -m-[1px]"></div>
            <div className="relative z-20 flex flex-col gap-8 items-center justify-center">
              <div className="relative">
                <Image
                  src="/chainLogos/nubitt.png"
                  alt="Nubit logo"
                  width={96}
                  draggable="false"
                  height={96}
                  className="object-cover w-[96px] h-[96px] rounded-[20px] relative z-30"
                />
                {/* Logo glow effect */}
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-white/20 blur-[120px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-full object-cover bg-nubitEffect/65 blur-[45px] -z-10"></div>
                <div className="absolute inset-0 w-full h-full rounded-[20px] object-cover bg-white/30 blur-[30px] -z-10"></div>
              </div>
              <h3 className="font-bold text-2xl text-white transition-colors duration-300">
                Nubit
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
