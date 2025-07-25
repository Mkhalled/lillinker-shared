'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ComingSoonPage = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const targetDate = new Date('2025-09-10T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
      <div className="text-center max-w-4xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4">
            Lillinker
          </h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Coming Soon Text */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-4xl font-semibold mb-6 text-gray-700">
            Something Amazing is Coming Soon
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We&apos;re building the perfect platform to connect freelancers with companies.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="mb-16">
          <h3 className="text-xl md:text-2xl font-semibold mb-8 text-gray-700">
            Launch Date: September 10, 2025
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
              >
                <div className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base text-gray-500 uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-gray-300">
          <p className="text-gray-500">
            © 2025 Lillinker. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
export default ComingSoonPage;