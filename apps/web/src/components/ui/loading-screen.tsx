/**
 * Full-screen loading dengan animasi
 * Ditampilkan saat mengecek session atau loading data
 */
export function LoadingScreen({ message = "Memuat..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-zinc-800 border-t-emerald-500" />
          <div className="absolute inset-2 flex items-center justify-center">
            <span className="text-xl">🏦</span>
          </div>
        </div>

        {/* Message */}
        <h2 className="mb-1 text-lg font-semibold text-zinc-200">ZenDompi</h2>
        <p className="text-sm text-zinc-500">{message}</p>

        {/* Loading dots */}
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}