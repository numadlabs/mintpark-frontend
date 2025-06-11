import React from "react";
import Image from "next/image";

export default function LiveNetworks() {
  return (
    <>
      <div className="max-w-[1216px] w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-[136px]">
        <div className="flex flex-col items-start justify-center gap-8">
          <h1 className="font-bold text-center text-neutral00 text-3xl md:text-5xl">
            Live connected network
          </h1>
          <div className="w-20 h-1 bg-brand rounded-lg" />
          <p className="text-normal text-xl text-neutral50">
            Mint Park brings the NFT world to life with a real-time view of our
            active community. See live minting, trending collections, and user
            interactions as they happen. It’s a dynamic, connected space where
            creators and collectors move together in sync.
          </p>
        </div>
        <div className="grid gap-8">
          <div
            className="bg-[url('/liveNetworks/citreaTestnet.png')] bg-cover w-auto h-auto flex p-6 gap-6 rounded-3xl items-center justify-start"
            style={{
              background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/liveNetworks/citreaTestnet.png')`,
              backgroundSize: "cover",
            }}
          >
            <Image
              src="/chainLogos/citrea.png"
              alt="citrea logo"
              width={60}
              draggable="false"
              height={60}
              className="object-cover w-[60px] h-[60px] rounded-2xl"
            />
            <h3 className="font-bold text-2xl">Citrea Testnet</h3>
          </div>
          <div
            className="bg-[url('/liveNetworks/hemiMainnet.png')] bg-cover w-auto h-auto flex p-6 gap-6 rounded-3xl items-center justify-start"
            style={{
              background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/liveNetworks/hemiMainnet.png')`,
              backgroundSize: "cover",
            }}
          >
            <Image
              src="/chainLogos/hemi.png"
              alt="hemi logo"
              width={60}
              draggable="false"
              height={60}
              className="object-cover w-[60px] h-[60px] rounded-2xl"
            />
            <h3 className="font-bold text-2xl">Hemi Mainnet</h3>
          </div>
          <div
            className="bg-[url('/liveNetworks/hemiTestnet.png')] bg-cover w-auto h-auto flex p-6 gap-6 rounded-3xl items-center justify-start"
            style={{
              background: `linear-gradient(rgba(17, 19, 21, 0.7), rgba(17, 19, 21, 0.7)), url('/liveNetworks/hemiTestnet.png')`,
              backgroundSize: "cover",
            }}
          >
            <Image
              src="/chainLogos/hemi.png"
              alt="hemi logo"
              width={60}
              draggable="false"
              height={60}
              className="object-cover w-[60px] h-[60px] rounded-2xl"
            />
            <h3 className="font-bold text-2xl">Hemi Testnet</h3>
          </div>
        </div>
      </div>
    </>
  );
}
