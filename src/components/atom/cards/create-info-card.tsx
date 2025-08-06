import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight } from "iconsax-react";
import { Button } from "@/components/ui/button";

export default function CreateInfoCard() {
  return (
    <>
      <Dialog>
        <form>
          <DialogTrigger asChild>
            <div className="max-w-4xl mx-auto">
              <div className="group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-darkSecondary border border-transLight4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Question Mark Icon */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-transLight12">
                      <span className="text-white font-bold text-lg">?</span>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                      <p className="text-white text-lg font-medium">
                        Learn about launching recursive NFT collection on Mint
                        Park
                      </p>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0 ml-4">
                    <ArrowRight
                      size={24}
                      color="#97989B"
                      className="transition-all duration-300 group-hover:translate-x-2 group-hover:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] bg-transDark8 border-transLight4">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lightPrimary text-2xl font-semibold">
                How it works
              </DialogTitle>
              <DialogDescription className="text-transLight48 text-lg mt-2">
                Please review the steps and responsibilities involved in
                launching a recursive NFT collection on Mint Park
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Step 1 */}
              <div className="flex gap-3 bg-transLight2 border border-transLight4 p-4 rounded-2xl">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-[4px] bg-transLight4 border border-transLight4 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-medium mb-2">
                    Enter Collection Details
                  </h3>
                  <p className="text-transLight48 text-md leading-relaxed">
                    Provide collection name, logo, background, and token symbol.
                    After this, you&lsquo;ll deploy your smart contract. These
                    details are permanent — double-check before deploying.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 bg-transLight2 border border-transLight4 p-4 rounded-2xl">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-[4px] bg-transLight4 border border-transLight4 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-medium mb-2">
                    Upload Trait Assets
                  </h3>
                  <p className="text-transLight48 text-md  leading-relaxed">
                    Upload a folder containing trait images and a metadata JSON
                    file. These assets will be used to generate your NFTs via
                    recursive inscriptions. Make sure everything is final.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 bg-transLight2 border border-transLight4 p-4 rounded-2xl">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-[4px] bg-transLight4 border border-transLight4 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-medium mb-2">
                    Pay Inscription Fee
                  </h3>
                  <p className="text-transLight48 text-md  leading-relaxed">
                    You&lsquo;ll be shown the fee to inscribe your assets
                    on-chain. This is non-refundable. You&lsquo;ll also need to
                    provide a contact address for review updates.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 bg-transLight2 border border-transLight4 p-4 rounded-2xl">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-[4px] bg-transLight4 border border-transLight4 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">4</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-medium mb-2">
                    Configure Launch Details
                  </h3>
                  <p className="text-transLight48 text-md leading-relaxed">
                    Set up your mint phases (e.g., Whitelist, FCFS, Public),
                    dates, supply, wallet limits, and whitelist addresses. Then,
                    submit your collection for review.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-transLight4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 text-gray-300 hover:text-white"
                >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
}
