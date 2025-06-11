"use client";

import React from "react";
import Image from "next/image";

export default function Partners() {
  return (
    <>
      <div className="max-w-[1216px] w-full grid gap-16">
        <h1 className="font-bold text-center text-neutral00 text-3xl md:text-5xl">
          Our Partners
        </h1>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div
              className="relative bg-[url('/homePage/citreaBG.png')] bg-cover grid w-auto h-auto rounded-[32px] p-8 gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/citreaBG.png')`,
                backgroundSize: "cover",
              }}
            >
              <Image
                src="/chainLogos/citrea.png"
                alt="citrea logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-20 h-20 rounded-2xl"
              />
              <div className="grid gap-4">
                <h2 className="font-bold text-profileTitle">Citrea</h2>
                <p className="text-lg font-normal text-neutral50">
                  Citrea is the first rollup that enhances the capabilities of
                  Bitcoin blockspace with zero-knowledge technology, making it
                  possible to build everything on Bitcoin.
                </p>
              </div>
            </div>
            <div
              className="bg-[url('/homePage/midnightBG.png')] bg-cover grid w-auto h-auto rounded-[32px] bg-neutral600 bg-opacity-[70%] p-8 gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/midnightBG.png')`,
                backgroundSize: "cover",
              }}
            >
              <Image
                src="/chainLogos/midnight.png"
                alt="midnight logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-20 h-20 rounded-2xl"
              />
              <div className="grid gap-4">
                <h2 className="font-bold text-profileTitle">Midnight</h2>
                <p className="text-lg font-normal text-neutral50">
                  Midnight is a fourth-generation blockchain – empowering
                  organizations to deliver regulation-friendly, data-protecting
                  applications that keep users in control of their own
                  information.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div
              className="bg-[url('/homePage/hemiBG.png')]  bg-cover grid w-auto h-auto rounded-[32px] bg-neutral600 bg-opacity-[70%] p-8 gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/hemiBG.png')`,
                backgroundSize: "cover",
              }}
            >
              <Image
                src="/chainLogos/hemi.png"
                alt="hemi logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-20 h-20 rounded-2xl"
              />
              <div className="grid gap-4">
                <h2 className="font-bold text-profileTitle">Hemi</h2>
                <p className="text-lg font-normal text-neutral50">
                  The Programmable Bitcoin Chain. Hemi is the network that
                  scales Bitcoin beyond money, enabling true BTCFi.
                </p>
              </div>
            </div>
            <div
              className="bg-[url('/homePage/nubitBG.png')] bg-cover grid w-auto h-auto rounded-[32px] bg-neutral600 bg-opacity-[70%] p-8 gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/nubitBG.png')`,
                backgroundSize: "cover",
              }}
            >
              <Image
                src="/chainLogos/nubitt.png"
                alt="nubit logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-20 h-20 rounded-2xl"
              />
              <div className="grid gap-4">
                <h2 className="font-bold text-profileTitle">Nubit</h2>
                <p className="text-lg font-normal text-neutral50">
                  Bitcoin Thunderbolt. Nubit boost the Bitcoin network to
                  another level with Bitcoin Core.
                </p>
              </div>
            </div>
            <div
              className="bg-[url('/homePage/botanixBG.png')] bg-cover grid w-auto h-auto rounded-[32px] bg-neutral600 bg-opacity-[70%] p-8 gap-8"
              style={{
                background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/homePage/botanixBG.png')`,
                backgroundSize: "cover",
              }}
            >
              <Image
                src="/chainLogos/botanix.png"
                alt="botanix logo"
                width={80}
                draggable="false"
                height={80}
                className="object-cover w-20 h-20 rounded-2xl"
              />
              <div className="grid gap-4">
                <h2 className="font-bold text-profileTitle">Botanix</h2>
                <p className="text-lg font-normal text-neutral50">
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
