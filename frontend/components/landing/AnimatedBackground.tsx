'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const particleValue = (index: number, offset: number) => {
  const value = Math.sin(index * 12.9898 + offset * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: particleValue(i, 1) * 100,
  y: particleValue(i, 2) * 100,
  size: particleValue(i, 3) * 3 + 1,
  duration: particleValue(i, 4) * 8 + 8,
  delay: particleValue(i, 5) * 5,
  color: ['#7047F5', '#19D9ED', '#FF4F81'][i % 3],
}));

export default function AnimatedBackground() {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrolled = window.scrollY;
      containerRef.current.style.setProperty(
        '--scroll-y',
        `${scrolled * 0.3}px`
      );
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReduced]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, #070419 0%, #05091B 40%, #020414 100%)',
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      {/* Large purple ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '700px',
          height: '700px',
          top: '5%',
          left: '10%',
          background:
            'radial-gradient(circle, rgba(112,71,245,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={
          prefersReduced
            ? {}
            : {
                x: [0, 40, -20, 0],
                y: [0, -30, 20, 0],
              }
        }
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cyan ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          top: '40%',
          right: '5%',
          background:
            'radial-gradient(circle, rgba(25,217,237,0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
        animate={
          prefersReduced
            ? {}
            : {
                x: [0, -30, 20, 0],
                y: [0, 20, -15, 0],
              }
        }
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Pink ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '400px',
          height: '400px',
          bottom: '10%',
          left: '30%',
          background:
            'radial-gradient(circle, rgba(255,79,129,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={
          prefersReduced
            ? {}
            : {
                x: [0, 20, -30, 0],
                y: [0, -15, 10, 0],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {mounted &&
        !prefersReduced &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise-texture" />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(2,4,20,0.6) 100%)',
        }}
      />
    </div>
  );
}
