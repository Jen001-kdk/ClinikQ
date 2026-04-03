import React, { useState, useEffect } from 'react';

const RollingNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = parseInt(value) || 0;
    if (start === end) return;

    let duration = 1500;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const current = Math.floor(easeOut * (end - start) + start);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}</span>;
};

export default RollingNumber;
