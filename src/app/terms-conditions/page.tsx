import Header from "@/components/layout/header";
import Layout from "@/components/layout/layout";
import React from "react";

const TermsConditions = () => {
  return (
    <>
      <Layout>
        <Header />
        <section className="mt-[43.5px] grid gap-16">
          <div className="relative h-[156px] sm:h-[216px] w-full rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${"/footer/terms.webp"})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div
              className="absolute inset-0 bg-neutral500 bg-opacity-[70%] z-50"
              style={{
                backdropFilter: "blur(50px)",
              }}
            />
            <div className="relative w-full h-full flex flex-col justify-center gap-12 z-50">
              <div className="flex flex-col items-center justify-center pt-8 pb-8 gap-4 sm:gap-6">
                <h1 className="font-bold text-2xl sm:text-logoSize text-neutral50">
                  Terms and Conditions
                </h1>
                <p className="font-normal text-sm sm:text-lg text-neutral100">
                  Last updated: Oct 31, 2024
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-12 pb-40 w-full">
            <div className="max-w-[592px] w-full flex flex-col gap-4">
              <h1 className="font-medium text-lg sm:text-xl text-neutral50 ">
                Introduction
              </h1>
              <p className="text-neutral200 font-medium text-md sm:text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                porttitor nec leo nec dignissim. Vestibulum volutpat nulla non
                diam elementum, non posuere nisi condimentum. Phasellus luctus
                viverra mauris et congue. Proin porttitor quam est. Curabitur a
                felis vitae nisi pulvinar tincidunt sodales non libero.{" "}
              </p>
            </div>
            <div className="max-w-[592px] w-full flex flex-col gap-4">
              <h1 className="font-medium text-lg sm:text-xl text-neutral50 ">
                Introduction
              </h1>
              <p className="text-neutral200 font-medium text-md sm:text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                porttitor nec leo nec dignissim. Vestibulum volutpat nulla non
                diam elementum, non posuere nisi condimentum. Phasellus luctus
                viverra mauris et congue. Proin porttitor quam est. Curabitur a
                felis vitae nisi pulvinar tincidunt sodales non libero. Sed
                venenatis enim non tellus euismod, sed porttitor tellus commodo.
                Proin erat est, porttitor ut dolor a, faucibus convallis magna.
                Quisque porttitor, lectus tristique tristique hendrerit, mauris
                velit rutrum nulla, sed ultrices quam velit vel justo. Nam
                laoreet metus dui, ut aliquam nulla varius et. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit. Morbi porttitor nec leo
                nec dignissim. Vestibulum volutpat nulla non diam elementum, non
                posuere nisi condimentum. Phasellus luctus viverra mauris et
                congue. Proin porttitor quam est. Curabitur a felis vitae nisi
                pulvinar tincidunt sodales non libero. Sed venenatis enim non
                tellus euismod
              </p>
            </div>
            <div className="max-w-[592px] w-full flex flex-col gap-4">
              <h1 className="font-medium  text-neutral50 ">Introduction</h1>
              <p className="text-neutral200 font-medium text-md sm:text-lg">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                porttitor nec leo nec dignissim. Vestibulum volutpat nulla non
                diam elementum, non posuere nisi condimentum. Phasellus luctus
                viverra mauris et congue. Proin porttitor quam est. Curabitur a
                felis vitae nisi pulvinar tincidunt sodales non libero. Sed
                venenatis enim non tellus euismod, sed porttitor tellus commodo.
                Proin erat est, porttitor ut dolor a, faucibus convallis magna.
                Quisque porttitor, lectus tristique tristique hendrerit, mauris
                velit rutrum nulla, sed ultrices quam velit vel justo. Nam
                laoreet metus dui, ut aliquam nulla varius et.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default TermsConditions;
