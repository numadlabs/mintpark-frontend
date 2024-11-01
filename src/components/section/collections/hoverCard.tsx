import { Global } from "iconsax-react";
import DiscordIcon from "@/components/icon/hoverIcon";
import ThreadIcon from "@/components/icon/thread";
import { ReactNode } from "react";
import { CollectionDataType } from "@/lib/types";

export type CardType = {
  data: CollectionDataType;
  handleNav?: () => void; // Made optional with ?
};

const HoverCard: React.FC<CardType> = ({ data, handleNav = () => {} }) => {
  const links = [
    {
      url: data?.websiteUrl,
      isIcon: true,
      icon: <Global size={24} className="hover:text-brand text-neutral00" />,
    },
    {
      url: data?.discordUrl,
      isIcon: false,
      icon: (
        <DiscordIcon size={24} className="hover:text-brand text-neutral00" />
      ),
    },
    {
      url: data?.twitterUrl,
      isIcon: false,
      icon: (
        <ThreadIcon size={24} className="hover:text-brand text-neutral00" />
      ),
    },
  ].filter(
    (link) => link.url !== null && link.url !== undefined && link.url !== "",
  );

  const handleSocialClick = (url: string | undefined) => {
    if (!url) return;
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    window.open(validUrl, "_blank", "noopener,noreferrer");
    // window.location.href = validUrl;
  };

  return (
    <div
      onClick={handleNav}
      className="absolute collection-card right-10 top-1"
    >
      <div className="flex flex-col gap-[10px] pt-8">
        {links.map((link, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering handleNav when clicking social buttons
              handleSocialClick(link.url);
            }}
            className="h-10 w-10 border hover:text-brand iconHover border-transparent rounded-lg p-2 bg-neutral500 bg-opacity-[50%] cursor-pointer"
          >
            <div className="aspect-square rounded-3xl">{link.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HoverCard;
