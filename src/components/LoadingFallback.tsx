export function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        <p className="text-sm font-medium text-slate-500">Đang tải...</p>
      </div>
    </div>
  );
}
