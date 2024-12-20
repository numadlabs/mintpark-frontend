import React from "react";

interface IconProps {
  size: number;
  className?: string;
}

const XLogo: React.FC<IconProps> = ({ size, className }) => (
  <svg
    width={size}
    height={size * (271 / 300)} // Maintain aspect ratio
    viewBox="0 0 300 271"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    // fill="#ffffff"
  >
    <path d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z" />
  </svg>
);

export default XLogo;
