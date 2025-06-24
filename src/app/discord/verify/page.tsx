// app/discord/verify/page.tsx
import dynamic from 'next/dynamic';

const VerifyPage = dynamic(() => import('@/components/verify/verify-page'), {
  ssr: false,
});

export default function Page() {
  return <VerifyPage />;
}


