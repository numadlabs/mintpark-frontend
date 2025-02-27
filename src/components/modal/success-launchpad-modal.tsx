import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 300, 
      delay: 0.1 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 20, 
    transition: { 
      duration: 0.2 
    } 
  }
};


export const SuccessModal = ({
  isOpen,
  onClose,
  onViewCollection,
}: {
  isOpen: boolean;
  onClose: () => void;
  onViewCollection: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalBackdropVariants}
        >
          <motion.div 
            className="bg-neutral900 w-full max-w-[400px] p-8 rounded-md border border-neutral700"
            variants={modalContentVariants}
          >
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="focus:outline-none text-neutral50 hover:text-neutral400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                delay: 0.3 
              }}
            >
              <div className="bg-green-500/20 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </motion.div>
            <motion.div 
              className="text-center font-semibold text-neutral50 text-2xl mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Minting Success!
            </motion.div>
            <motion.div 
              className="text-center text-neutral100 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Minting in progress! 🚀 Your NFTs are in the queue and will be sent to
              your wallet soon. Thanks for your patience!
            </motion.div>
            <motion.div 
              className="flex gap-4 justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={onClose}
                className="py-2 px-4 border border-neutral700 rounded-md text-neutral50 hover:bg-neutral800 transition-colors w-1/2"
              >
                Close
              </button>
              <button
                onClick={onViewCollection}
                className="py-2 px-4 bg-brand text-neutral900 font-semibold rounded-md hover:bg-brand/90 transition-colors w-1/2"
              >
                View Collections
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
