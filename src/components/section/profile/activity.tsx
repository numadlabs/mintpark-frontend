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
            {/* <ActivityCard/> */}
        </div>
    </div>
  )
}

export default Activity

//responsive ui code

// import React from 'react';

// const Activity = () => {
//   const headers = [
//     { id: 1, label: 'Item', className: 'sm:max-w-[360px]' },
//     { id: 2, label: 'Event', className: 'sm:max-w-[220px]' },
//     { id: 3, label: 'Price', className: 'sm:max-w-[200px]' },
//     { id: 4, label: 'Address', className: 'sm:max-w-[260px]' },
//     { id: 5, label: 'Date', className: 'sm:max-w-[152px]' }
//   ];

//   return (
//     <div className="mt-8 w-full">
//       {/* Desktop Header */}
//       <div className="hidden sm:flex flex-row items-center justify-between px-3 pb-4 border-b border-neutral-200">
//         {headers.map(header => (
//           <p
//             key={header.id}
//             className={`w-full text-sm md:text-md text-neutral-600 font-medium ${header.className}`}
//           >
//             {header.label}
//           </p>
//         ))}
//       </div>

//       {/* Mobile Header - Shows as cards on mobile */}
//       <div className="sm:hidden">
//         <h2 className="text-lg font-semibold px-4 pb-2 border-b border-neutral-200">
//           Activity
//         </h2>
//       </div>

//       {/* Content Area */}
//       <div className="mt-3 flex flex-col gap-3 px-4 sm:px-0">
//         {/* Mobile Card View */}
//         <div className="block sm:hidden">
//           {/* Sample Mobile Card */}
//           <div className="p-4 rounded-lg border border-neutral-200 space-y-2">
//             {headers.map(header => (
//               <div key={header.id} className="flex justify-between items-center">
//                 <span className="text-sm text-neutral-500">{header.label}:</span>
//                 <span className="text-sm font-medium">Sample Data</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Desktop Table View */}
//         <div className="hidden sm:block">
//           {/* Sample Desktop Row */}
//           <div className="flex flex-row items-center justify-between px-3 py-4 hover:bg-neutral-50 rounded-lg transition-colors">
//             {headers.map(header => (
//               <div
//                 key={header.id}
//                 className={`w-full truncate ${header.className}`}
//               >
//                 <span className="text-sm text-neutral-800">Sample Data</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Activity;