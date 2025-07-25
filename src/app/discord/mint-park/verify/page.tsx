// app/discord/verify/page.tsx
import dynamic from 'next/dynamic';

const VerifyNew = dynamic(() => import('@/components/verify/verify-new'), {
  ssr: false,
});

export default function Page() {
  return <VerifyNew />;
}


