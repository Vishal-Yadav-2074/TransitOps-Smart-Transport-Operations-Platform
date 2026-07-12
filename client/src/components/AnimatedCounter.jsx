import React, { useEffect, useState } from 'react';

export default function AnimatedCounter({ value, duration = 1000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const isNum = typeof value === 'number';
    const parsed = isNum ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''));
    
    if (isNaN(parsed) || parsed === 0) {
      setCount(value);
      return;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * parsed);

      if (typeof value === 'string') {
        if (value.startsWith('₹')) {
          setCount('₹' + current.toLocaleString('en-IN'));
        } else if (value.endsWith('%')) {
          setCount(current + '%');
        } else {
          setCount(current);
        }
      } else {
        setCount(current);
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count}</span>;
}
