export default function ProfileLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading profile">
      <div className="h-44 animate-pulse rounded-[20px] bg-trap-surface" />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-48 animate-pulse rounded-[20px] bg-trap-surface" />
        <div className="h-48 animate-pulse rounded-[20px] bg-trap-surface" />
      </div>
      <div className="h-56 animate-pulse rounded-[20px] bg-trap-surface" />
    </div>
  );
}
