import React from 'react'
import ActivityCard from '@/components/atom/cards/activity-card'
import { s3ImageUrlBuilder } from '@/lib/utils'
import { getCollectibleActivity, getCollectionById, getLayerById } from '@/lib/service/queryHelper';
import { useQuery } from '@tanstack/react-query';
import { Collectible } from '@/lib/validations/collection-validation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/provider/auth-context-provider';

const Activity = () => {
  const params = useParams();
    const { authState } = useAuth();
  const id = params.detailId as string;

  const { data: activity = [] } = useQuery({
    queryKey: ["activityData", id],
    queryFn: () => getCollectibleActivity(id),
    enabled: !!id,
  });


  const { data: collectible, isLoading: isCollectionLoading } = useQuery<
    Collectible[] | null
  >({
    queryKey: ["collectionData", id],
    queryFn: () => getCollectionById(id),
    enabled: !!id,
  });

    const { data: currentLayer = [] } = useQuery({
      queryKey: ["currentLayerData", authState.layerId],
      queryFn: () => getLayerById(authState.layerId as string),
      enabled: !!authState.layerId,
    });

  const currentAsset = collectible?.[0];

  return (
    <div className='mt-8 flex flex-col w-full'>
      <div className='flex flex-row items-center justify-between px-3 pb-4 border-b border-neutral500'>
        <p className='max-w-[360px] w-full text-md text-neutral200 font-medium'>Item</p>
        <p className='max-w-[220px] w-full text-md text-neutral200 font-medium'>Event</p>
        <p className='max-w-[200px] w-full text-md text-neutral200 font-medium'>Price</p>
        <p className='max-w-[260px] w-full text-md text-neutral200 font-medium'>Address</p>
        <p className='max-w-[152px] w-full text-md text-neutral200 font-medium'>Date</p>
      </div>
      <div className='mt-3 flex flex-col gap-3'>
        <div className="flex flex-col gap-3 pt-3">
          {activity && activity.length > 0 && currentAsset ? (
            activity.map((item: any) => (
              <ActivityCard
                key={`${item.id}-${item.event}-${item.date}`}
                data={item}
                currenAsset={currentAsset.name}
                currentLayer={currentLayer.name}
              />
            ))
          ) : (
            <div className="flex justify-center items-center mt-3 rounded-3xl w-full bg-neutral500 bg-opacity-[50%] h-[430px]">
              <p className="text-neutral200 font-medium text-lg">
                {isCollectionLoading ? "Loading..." : "No activity recorded"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Activity