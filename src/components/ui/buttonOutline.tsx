import React from "react";

interface buttonProps {
    title: string;
    onClick: () => void;
}

const ButtonOutline: React.FC<buttonProps> = ({ title, onClick }) => {
    return(
        <button 
          className='py-3 w-full rounded-xl text-lg font-semibold border text-neutral50 border-neutral400'
          onClick={onClick}
        >
            {title}
        </button>
    )
}

export default ButtonOutline;
