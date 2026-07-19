import React, { useState, useEffect } from 'react';

interface NotificationBannerProps {
  title?: string;
  message: string;
  countdownDuration?: number;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  title,
  message,
  countdownDuration = 3,
}) => {
  const [visible, setVisible] = useState(true);
  const [countdown, setCountdown] = useState(countdownDuration);

  useEffect(() => {
    if (countdown <= 0) return undefined;

    const timerId = window.setTimeout(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [countdown]);

  const handleClose = () => {
    if (countdown > 0) return;
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  const displayTitle = title ?? 'Notification';

  return (
    <div className="w-full max-w-sm bg-white border border-green-100 shadow-2xl rounded-3xl ring-1 ring-black/5 md:max-w-md">
      <div className="px-4 py-3 overflow-hidden text-white rounded-3xl bg-gradient-to-r from-green-600 via-teal-500 to-cyan-500">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-100/90">
              {displayTitle}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/95 sm:text-base">
              Important update
            </p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 text-white rounded-2xl bg-white/15">
            !
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-sm leading-6 text-slate-700 sm:text-base">
          {message}
        </p>

        <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-500">
            {countdown > 0
              ? `Close available in ${countdown} second${countdown === 1 ? '' : 's'}`
              : 'You can close this notification now.'}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={countdown > 0}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition ${countdown > 0 ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {countdown > 0 ? `Close in ${countdown}` : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
