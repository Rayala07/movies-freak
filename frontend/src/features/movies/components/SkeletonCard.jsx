/**
 * SkeletonCard — Phase F4
 * ----------------------
 * A pulsing placeholder for the MovieCard.
 * Maintains UI stability (no layout shift) while images are loading.
 */
const SkeletonCard = () => {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {/* Poster placeholder */}
      <div 
        className="w-full aspect-[2/3] rounded-2xl" 
        style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
      />
      
      {/* Title & Info placeholders */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded-md" style={{ background: "var(--bg-hover)" }} />
        <div className="h-3 w-1/2 rounded-md" style={{ background: "var(--bg-hover)" }} />
      </div>
    </div>
  );
};

export default SkeletonCard;
