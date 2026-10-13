import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = 'rect',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading..."
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card-skeleton">
      <div className="stat-card-skeleton__header">
        <Skeleton width="80px" height="12px" variant="text" />
        <Skeleton width="36px" height="36px" variant="rect" />
      </div>
      <Skeleton width="120px" height="28px" variant="text" />
      <Skeleton width="100px" height="14px" variant="text" />
    </div>
  );
}
