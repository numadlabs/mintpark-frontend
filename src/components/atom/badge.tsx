import React from 'react';

const Badge = ({ label }: { label: string }) => {
  return (
    <div className="absolute -top-2 right-0 mr-10 sm:mr-0 transform translate-x-1/2 bg-brand pl-2 py-0.5 rounded-md text-xs font-bold text-neutral500">
      <div className="flex items-center gap-1 w-[50px]">
        <span className="w-2 h-2 bg-neutral500 rounded-full animate-pulse"></span>
        {label}
      </div>
    </div>
  );
};

export default Badge;