"use client";

import React from "react";
import Image from "next/image";

export default function Partners() {
  return (
    <>
      <div className="max-w-[1216px] w-full px-4 sm:px-6 lg:px-8 grid gap-8 sm:gap-12 lg:gap-16">
        <h1 className="font-bold text-center text-neutral00 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          Our Partners
        </h1>
        <div className="grid gap-4 sm:gap-6 lg:gap-8">
          {/* First row - 2 cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div
              className="relative bg-[url('/homePage/citreaBG.png')] bg-cover grid w-full h-auto rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/citreaBG.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Image
                src="/chainLogos/citrea.png"
                alt="citrea logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl"
              />
              <div className="grid gap-2 sm:gap-3 lg:gap-4">
                <h2 className="font-bold  text-lg sm:text-xl lg:text-profileTitle">
                  Citrea
                </h2>
                <p className="text-sm sm:text-base lg:text-lg font-normal text-neutral50 leading-relaxed">
                  Citrea is the first rollup that enhances the capabilities of
                  Bitcoin blockspace with zero-knowledge technology, making it
                  possible to build everything on Bitcoin.
                </p>
              </div>
            </div>
            <div
              className="bg-[url('/homePage/midnightBG.png')] bg-cover grid w-full h-auto rounded-2xl sm:rounded-3xl lg:rounded-[32px] bg-neutral600 bg-opacity-[70%] p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/midnightBG.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Image
                src="/chainLogos/midnight.png"
                alt="midnight logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl"
              />
              <div className="grid gap-2 sm:gap-3 lg:gap-4">
                <h2 className="font-bold  text-lg sm:text-xl lg:text-profileTitle">
                  Midnight
                </h2>
                <p className="text-sm sm:text-base lg:text-lg font-normal text-neutral50 leading-relaxed">
                  Midnight is a fourth-generation blockchain – empowering
                  organizations to deliver regulation-friendly, data-protecting
                  applications that keep users in control of their own
                  information.
                </p>
              </div>
            </div>
          </div>

          {/* Second row - 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div
              className="bg-[url('/homePage/hemiBG.png')] bg-cover grid w-full h-auto rounded-2xl sm:rounded-3xl lg:rounded-[32px] bg-neutral600 bg-opacity-[70%] p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/hemiBG.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Image
                src="/chainLogos/hemi.png"
                alt="hemi logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl"
              />
              <div className="grid gap-2 sm:gap-3 lg:gap-4">
                <h2 className="font-bold  text-lg sm:text-xl lg:text-profileTitle">
                  Hemi
                </h2>
                <p className="text-sm sm:text-base lg:text-lg font-normal text-neutral50 leading-relaxed">
                  The Programmable Bitcoin Chain. Hemi is the network that
                  scales Bitcoin beyond money, enabling true BTCFi.
                </p>
              </div>
            </div>
            <div
              className="bg-[url('/homePage/nubitBG.png')] bg-cover grid w-full h-auto rounded-2xl sm:rounded-3xl lg:rounded-[32px] bg-neutral600 bg-opacity-[70%] p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/nubitBG.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Image
                src="/chainLogos/nubitt.png"
                alt="nubit logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl"
              />
              <div className="grid gap-2 sm:gap-3 lg:gap-4">
                <h2 className="font-bold text-lg sm:text-xl lg:text-profileTitle">
                  Nubit
                </h2>
                <p className="text-sm sm:text-base lg:text-lg font-normal text-neutral50 leading-relaxed">
                  Bitcoin Thunderbolt. Nubit boosts the Bitcoin network to
                  another level with Bitcoin Core.
                </p>
              </div>
            </div>
            <div
              className="bg-[url('/homePage/botanixBG.png')] bg-cover grid w-full h-auto rounded-2xl sm:rounded-3xl lg:rounded-[32px] bg-neutral600 bg-opacity-[70%] p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8 sm:col-span-2 lg:col-span-1"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/botanixBG.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Image
                src="/chainLogos/botanix.png"
                alt="botanix logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl"
              />
              <div className="grid gap-2 sm:gap-3 lg:gap-4">
                <h2 className="font-bold  text-lg sm:text-xl lg:text-profileTitle">
                  Botanix
                </h2>
                <p className="text-sm sm:text-base lg:text-lg font-normal text-neutral50 leading-relaxed">
                  Botanix is building a new Layer 2 protocol called the
                  Spiderchain that supports a decentralized financial system
                  running on Bitcoin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
