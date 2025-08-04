// app/discord/verify/page.tsx
import dynamic from 'next/dynamic';

const VerifyCitrea = dynamic(() => import('@/components/verify/verify-citrea'), {
  ssr: false,
});

export default function Page() {
  return <VerifyCitrea />;
}


