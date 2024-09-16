import React from "react";

interface InputProps {
  title: string;
  text: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const Input: React.FC<InputProps> = ({
  title,
  text,
  value,
  onChange,
  type,
}) => {
  return (
    <div className="flex flex-col w-full gap-3">
      <p className="font-medium text-lg2 text-neutral50">{title}</p>
      <input
        type={type ?? "text"}
        placeholder={text}
        className="px-5 py-3.5 bg-background border rounded-xl border-neutral50 text-lg2 placeholder-neutral200 text-neutral-50 w-full"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
