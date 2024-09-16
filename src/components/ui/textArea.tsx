import React from "react";


interface inputProps {
  title: string;
  text: string;
}

const Input: React.FC<inputProps> = ({ title, text }) => {
  return (
    <div className="w-full gap-3 flex flex-col h-auto">
      <p className="text-lg2 text-neutral50 font-medium">{title}</p>
      <textarea
        placeholder={text}
        className="px-5 py-3.5 bg-background border rounded-xl border-neutral50 text-lg2 placeholder-neutral200 
        text-neutral-50 w-full h-[128px] text-start"
      />
    </div>
  );
};

export default Input;
