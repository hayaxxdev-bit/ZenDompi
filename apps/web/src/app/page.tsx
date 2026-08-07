import { Button } from "@zendompi/ui";
import { APP_NAME } from "@zendompi/shared";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Selamat Datang di <span className="text-blue-600">{APP_NAME}</span>
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Platform pencatat keuangan pintar terintegrasi AI dan Messaging Apps.
      </p>
      <div className="mt-6 flex gap-4">
        <Button className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 font-medium">
          Mulai Sekarang
        </Button>
      </div>
    </main>
  );
}
