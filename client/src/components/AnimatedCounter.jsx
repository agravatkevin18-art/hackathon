import React, { useState, useEffect, useRef } from 'react';

/**
 * Animated counter that smoothly counts up from 0 to the target value.
 * Uses requestAnimationFrame for buttery smooth animation.
 */
export default function AnimatedCounter({ value, duration = 1500, suffix = '', prefix = '', decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = null;

    const target = typeof value === 'number' ? value : parseFloat(value) || 0;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (target - startValueRef.current) * eased;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span>
      {prefix}{formatted}{suffix}
    </span>
  );
}
