import React from "react";

interface ToggleProps {
  isChecked: boolean;
  
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const Toggle: React.FC<ToggleProps> = ({ isChecked, onChange }) => {
  return (
    <>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div
          className={`relative w-16 h-9 bg-neutral500 peer-focus:outline-none rounded-full peer after:transition-all 
                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                    after:content-[''] after:absolute after:top-[6px] after:start-[6px]
                    after:rounded-full after:h-6 after:w-6 peer-checked:bg-brand 
                    ${isChecked ? "after:bg-neutral600" : "after:bg-white"}`}
        />
      </label>
    </>
  );
};

export default Toggle;
