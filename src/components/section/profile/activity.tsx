import React from 'react'
import ActivityCard from '@/components/atom/cards/activity-card'

const Activity = () => {
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
            <ActivityCard/>
        </div>
    </div>
  )
}

export default Activity