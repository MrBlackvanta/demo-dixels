import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({ value, duration = 900, className }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    if (from === value) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(from + (value - from) * easeOut(progress)));
      if (progress < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    raf = requestAnimationFrame(tick);

    // A throttled or hidden tab starves rAF, so guarantee the true value lands.
    const settle = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      fromRef.current = value;
      setDisplay(value);
    }, duration + 250);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}
