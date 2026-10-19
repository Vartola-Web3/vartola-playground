export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#DCE6E1] border-t-[#15C77A]" aria-hidden="true" />
        <p className="mt-4 text-sm text-[#708078]" role="status">Loading…</p>
      </div>
    </div>
  );
}
