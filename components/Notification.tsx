'use client';

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onDismiss?: () => void;
}

const notificationIcon = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export default function Notification({ type, message, onDismiss }: NotificationProps) {
  const Icon = notificationIcon[type];
  return (
    <div className={`app-notification app-notification-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="app-notification-dismiss" onClick={onDismiss} aria-label="Dismiss notification">
          <X size={15} />
        </button>
      )}
    </div>
  );
}
