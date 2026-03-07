import { useEffect, useRef, useState } from "react";

const CountUp = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          animate();
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 } 
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animate = () => {
    let start = 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
  };

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

export default CountUp;
