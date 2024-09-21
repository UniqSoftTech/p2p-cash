"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSDK } from "@metamask/sdk-react";

const QrScanner = dynamic(() => import("../components/QrScanner"), {
  ssr: false,
});

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { sdk, connected, connecting, account } = useSDK();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center row-start-2 gap-8 sm:items-start">
        <QrScanner />
      </main>
    </div>
  );
}
