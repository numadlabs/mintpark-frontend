import { AnimatePresence, motion } from "framer-motion";
import React from "react";

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
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
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export const ErrorModal = ({
  isOpen,
  onClose,
  errorMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-50 top-0 left-0 w-full h-full bg-black/20 backdrop-blur-[15px] flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalBackdropVariants}
        >
          <motion.div
            className="bg-neutral900 w-[400px] bg-gray500op50 backdrop-blur-[60px] p-8 rounded-3xl border  border-white4"
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
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3,
              }}
            >
              <div className=" bg-white8 p-4 rounded-[16px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <path
                    d="M16.0894 34C15.5583 34 15.0273 33.8044 14.608 33.3853C13.7973 32.5749 13.7973 31.2337 14.608 30.4233L30.4291 14.6078C31.2397 13.7974 32.5814 13.7974 33.392 14.6078C34.2027 15.4181 34.2027 16.7593 33.392 17.5696L17.5709 33.3853C17.1796 33.8044 16.6205 34 16.0894 34Z"
                    fill="#FF5C69"
                  />
                  <path
                    d="M31.9106 34C31.3795 34 30.8484 33.8044 30.4291 33.3853L14.608 17.5696C13.7973 16.7593 13.7973 15.4181 14.608 14.6078C15.4186 13.7974 16.7603 13.7974 17.5709 14.6078L33.392 30.4233C34.2027 31.2337 34.2027 32.5749 33.392 33.3853C32.9727 33.8044 32.4417 34 31.9106 34Z"
                    fill="#FF5C69"
                  />
                </svg>
              </div>
            </motion.div>
            <motion.div
              className="text-center font-semibold text-neutral50 text-2xl mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Minting Unsuccessful
            </motion.div>
            <motion.div
              className="text-center text-neutral100 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {errorMessage}
            </motion.div>
            <motion.button
              onClick={onClose}
              className="w-full py-2 px-4 bg-white8 text-neutral900 font-semibold rounded-md hover:bg-brand/90 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
