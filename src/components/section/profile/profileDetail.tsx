import Image from "next/image";
import { CardType } from "@/components/atom/cards/collectionCard";
import DiscordIcon from "@/components/icon/hoverIcon";
import ThreadIcon from "@/components/icon/thread";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { collection } from "@/lib/constants";
import { Global, Notepad, Profile2User } from "iconsax-react";
import CollecBanner from "../collections/collecBanner";
import Assets from "./assets";
import Activity from "./activity";
import { getListableById, getListedCollections } from "@/lib/service/queryHelper";
import { useAuth } from "@/components/provider/auth-context-provider";
import { useQuery } from "@tanstack/react-query";
import { CollectibleList } from "@/lib/types";
import AssetsCard from "@/components/atom/cards/assetsCard";
import { useState } from "react";

const ProfileDetail = () => {
  const { authState } = useAuth();
  
  const [active, setActive] = useState(false);
  return (
    <div className="mt-8 flex flex-col gap-8">
      <Tabs defaultValue={"Assets"}>
        <TabsList
          defaultValue={"Assets"}
          className="grid grid-cols-2 gap-1 p-1 max-w-[196px] w-full border border-neutral400 rounded-xl"
        >
          <TabsTrigger value="Assets" className="rounded-lg border-0">
            Assets
          </TabsTrigger>
          <TabsTrigger value="Activity" className="rounded-lg border-0">
            Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Assets">
          <Assets detail/>
        </TabsContent>
        <TabsContent value="Activity">
          <Activity/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileDetail;
