import { AlertCircle, RefreshCw } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__icon">
        {icon || <AlertCircle size={32} />}
      </div>
      <h4 className="empty-state__title">{title}</h4>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && (
        <button className="empty-state__btn" onClick={action.onClick} type="button">
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={24} className="error-state__icon" />
      <span className="error-state__message">{message}</span>
      {onRetry && (
        <button className="error-state__btn" onClick={onRetry} type="button">
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}
