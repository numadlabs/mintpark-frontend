
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import Assets from "./assets";
import Activity from "./activity";
import { useAuth } from "@/components/provider/auth-context-provider";
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
