import React from "react";

interface buttonProps {
    nav: () => void;
}

const ButtonMd: React.FC<buttonProps> = ({ nav }) => {
    return(
        <button 
            className="text-neutral50 border-neutral400 border 
                       rounded-xl text-btnMedium px-5 py-2 
                       hover:text-neutral100  hover:border-neutral300" 
                onClick={nav}>
            Connect Wallet
        </button>
    )
}

export default ButtonMd