import { useEffect, useState } from 'react';

export function AudioWaveform({ isActive }) {
  const [bars, setBars] = useState(() => 
    Array(30).fill(0).map(() => Math.random() * 40 + 20)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prevBars) =>
        prevBars.map((height) => {
          if (isActive) {
            // Random variation when recording - more dynamic
            const change = (Math.random() - 0.5) * 20;
            return Math.max(15, Math.min(70, height + change));
          } else {
            // Return to baseline when paused
            return height + (30 - height) * 0.15;
          }
        })
      );
    }, 80);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="relative w-full h-20 bg-white rounded-lg overflow-hidden flex items-end justify-center gap-1 px-4 py-3">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-[#7DD87D]/30 rounded-full transition-all duration-75 ease-linear"
          style={{ 
            height: `${height}%`,
            maxWidth: '8px'
          }}
        />
      ))}
    </div>
  );
}