import { Global } from "iconsax-react";
import DiscordIcon from "@/components/icon/hoverIcon";
import ThreadIcon from "@/components/icon/thread";
import { ReactNode } from "react";

// Define interface for link items
interface LinkItem {
  url: string;
  isIcon: boolean;
  icon: ReactNode;
}

// Type-safe links array
const links: LinkItem[] = [
  {
    url: "https://www.youtube.com",
    isIcon: true,
    icon: <Global size="24" className="hover:text-brand text-neutral00" />,
  },
  {
    url: "https://discord.com",
    isIcon: true,
    icon: <DiscordIcon size={24} className="iconHover" />,
  },
  {
    url: "https://www.threads.net",
    isIcon: true,
    icon: <ThreadIcon size={24} className="iconHover" />,
  },
];

export default function HoverCard() {
  const handleClick = (url: string): void => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      // ene bolohoor shine tab neehgvigeer 
      // window.location.href = url;  
    }
  };

  return (
    <div className="absolute collection-card right-8 top-1">
      <div className="flex flex-col gap-[10px] pt-8">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              handleClick(link.url);
            }}
            className="h-10 w-10 border hover:text-brand iconHover border-transparent rounded-lg p-2 bg-neutral500 bg-opacity-[50%] cursor-pointer"
          >
            <div className="aspect-square rounded-3xl">{link.icon}</div>
          </a>
        ))}
      </div>
    </div>
  );
}