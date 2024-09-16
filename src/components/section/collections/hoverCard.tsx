import DiscordIcon from "@/components/icon/hoverIcon";
import ThreadIcon from "@/components/icon/thread";
import { Global } from "iconsax-react";
// import TwiterIcon from "../../icon/hover";

const links = [
  {
    url: "/collections",
    isIcon: true,
    icon: <Global size="24" className={`hover:text-brand text-neutral00`} />,
  },
  {
    url: "/collections",
    isIcon: true,
    icon: <DiscordIcon size={24} className={`iconHover`} />,
  },
  {
    url: "/collections",
    isIcon: false,
    icon: <ThreadIcon size={24} className={`iconHover`} />,
  },
];

export default function HoverCard() {
  return (
    <div className="absolute collection-card right-8 top-1">
      <div className="flex flex-col gap-[10px] pt-8">
        {links.map((link, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Button clicked");
            }}
            className="h-10 w-10 border hover:text-brand iconHover border-transparent rounded-lg p-2 bg-neutral500 bg-opacity-[50%]"
          >
            <div className="aspect-square rounded-3xl">{link.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
