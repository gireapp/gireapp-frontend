'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CONSENT_KEY = 'gireapp_cookie_consent';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem(CONSENT_KEY);
    let timer: ReturnType<typeof setTimeout>;
    if (!consent) {
      // Delay showing the banner slightly for better UX
      timer = setTimeout(() => setShow(true), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShow(false);
    // In M6, this is where we'd initialize Mixpanel/GA4
    // initializeAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 animate-slide-in-up">
      <div className="max-w-4xl mx-auto bg-card border border-border shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="font-semibold text-foreground text-lg">We value your privacy</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies to enhance your learning experience, analyze site traffic, and support our gamification engine. By clicking "Accept", you consent to our use of cookies in accordance with NDPR and POPIA guidelines.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted border border-border rounded-lg transition-colors"
          >
            Decline All
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-opacity"
          >
            Accept Cookies
          </button>
          <button
            onClick={handleDecline}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors md:hidden"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
