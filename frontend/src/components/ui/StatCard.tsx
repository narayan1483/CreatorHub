import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPercentage } from '../../utils';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__title">{title}</span>
        <div className="stat-card__icon">{icon}</div>
      </div>
      <div className="stat-card__value">{value}</div>
      <div className={`stat-card__change ${isPositive ? 'stat-card__change--positive' : 'stat-card__change--negative'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{formatPercentage(change)}</span>
        <span className="stat-card__period">vs last month</span>
      </div>
    </div>
  );
}
