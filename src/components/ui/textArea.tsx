import React from "react";

interface inputProps {
  title?: string;
  text: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Input: React.FC<inputProps> = ({ title, text, value, onChange }) => {
  return (
    <div className="w-full gap-3 flex flex-col h-auto">
      <p className="text-lg text-neutral50 font-medium">{title}</p>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={text}
        className="px-5 py-3.5 bg-background border rounded-xl border-neutral400 text-lg placeholder-neutral200 
        text-neutral-50 w-full h-[128px] text-start"
      />
    </div>
  );
};

export default Input;
