import React, { ButtonHTMLAttributes } from "react";

interface ButtonLgProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected: boolean;
  isLoading?: boolean;
}

const ButtonLg: React.FC<ButtonLgProps> = ({
  children,
  isSelected,
  isLoading = false,
  ...rest
}) => {
  return (
    <button
      className={`py-3 w-full rounded-xl text-lg font-semibold ${
        isSelected ? "bg-brand" : "bg-neutral500 text-neutral600"
      } ${isSelected ? "text-neutral600" : "text-neutral600"}`}
      disabled={!isSelected || isLoading}
      {...rest}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default ButtonLg;
