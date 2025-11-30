import { AlertCircle, XCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

type ErrorVariant = 'error' | 'warning' | 'info';

interface ErrorAlertProps {
  title?: string;
  message: string;
  variant?: ErrorVariant;
  retry?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const ErrorAlert = ({
  title,
  message,
  variant = 'error',
  retry,
  dismissible = false,
  onDismiss,
  className = '',
}: ErrorAlertProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const variantConfig = {
    error: {
      bgColor: 'bg-[#2A0A0A]',
      borderColor: 'border-[#4A1A1A]',
      textColor: 'text-[#FF8888]',
      iconColor: 'text-[#FF8888]',
      Icon: XCircle,
    },
    warning: {
      bgColor: 'bg-[#2A1A0A]',
      borderColor: 'border-[#4A2A1A]',
      textColor: 'text-[#FFD699]',
      iconColor: 'text-[#FFB088]',
      Icon: AlertTriangle,
    },
    info: {
      bgColor: 'bg-[#0A1A2A]',
      borderColor: 'border-[#1A3A4A]',
      textColor: 'text-[#88CCFF]',
      iconColor: 'text-[#88CCFF]',
      Icon: AlertCircle,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.Icon;

  return (
    <div
      className={`rounded-xl border-2 ${config.bgColor} ${config.borderColor} p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 shrink-0 ${config.iconColor}`} size={20} aria-hidden="true" />

        <div className="flex-1">
          {title && (
            <h3 className={`mb-1 font-bold ${config.textColor}`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${config.textColor}`}>{message}</p>

          {retry && (
            <button
              type="button"
              onClick={retry}
              className={`mt-3 flex items-center gap-2 rounded-lg border-2 ${config.borderColor} px-3 py-1.5 text-sm font-semibold ${config.textColor} transition-all hover:bg-[#3A2A2A]`}
              aria-label="Retry action"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          )}
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={`shrink-0 rounded-lg p-1 ${config.textColor} transition-all hover:bg-[#3A2A2A]`}
            aria-label="Dismiss alert"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
