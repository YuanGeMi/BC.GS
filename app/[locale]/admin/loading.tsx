export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-8" aria-busy="true" aria-live="polite">
      <div>
        <div className="bg-text/10 h-3 w-20 rounded-sm" />
        <div className="bg-text/10 mt-4 h-10 w-48 max-w-full rounded-sm" />
        <div className="bg-text/8 mt-4 h-4 w-full max-w-md rounded-sm" />
      </div>
      <div className="border-text/10 space-y-3 border-t pt-6">
        <div className="bg-text/8 h-4 w-full rounded-sm" />
        <div className="bg-text/8 h-4 w-[92%] rounded-sm" />
        <div className="bg-text/8 h-4 w-[88%] rounded-sm" />
        <div className="bg-text/8 h-4 w-[95%] rounded-sm" />
        <div className="bg-text/8 h-4 w-[70%] rounded-sm" />
      </div>
    </div>
  );
}
