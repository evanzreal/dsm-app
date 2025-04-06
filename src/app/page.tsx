'use client';

import Chat from '@/components/Chat';
import AuthGuard from '@/components/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <main className="min-h-screen w-full max-w-[430px] mx-auto bg-white relative">
        <div className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto bg-purple-600 text-white p-4 z-10">
          <h1 className="text-lg font-medium">Seu assistente especializado em DSM</h1>
        </div>
        <div className="h-screen pt-16 pb-0">
          <Chat />
        </div>
      </main>
    </AuthGuard>
  );
}
