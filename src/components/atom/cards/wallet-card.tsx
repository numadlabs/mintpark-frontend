import React from 'react'
import Image from 'next/image'

interface cardProps {
    image: any;
    title: string;
}

const WalletCard: React.FC<cardProps> = ({ image, title }) => {
  return (
    <div className='flex flex-row w-full gap-4 bg-white8 p-3 items-center rounded-2xl'>
        <Image src={image} alt='image' width={40} height={40} sizes='100%' className='w-10 h-10 rounded-lg'/>
        <span className='text-neutral50 text-lg font-bold'>{title}</span>
    </div>
  )
}

export default WalletCard