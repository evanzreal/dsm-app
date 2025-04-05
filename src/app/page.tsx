import Chat from '@/components/Chat';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-purple-600 p-4">
          <h1 className="text-2xl font-bold text-white">DSM Assistant</h1>
          <p className="text-purple-100">Seu assistente especializado em DSM</p>
        </div>
        <Chat />
      </div>
    </main>
  );
}
