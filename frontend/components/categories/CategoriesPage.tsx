'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/data';

export default function CategoriesPage() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="categories" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-trap-pink">
            Categories
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Pick your battlefield.
          </h2>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
              whileHover={prefersReduced ? {} : { y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-7 backdrop-blur-sm transition-colors duration-300 hover:border-white/20"
              style={{ ['--cat-color' as string]: cat.color }}
            >
              {/* Ambient glow */}
              <div
                className="absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: cat.glow }}
              />

              {/* Emoji */}
              <div className="relative mb-4 text-4xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 sm:text-5xl">
                {cat.emoji}
              </div>

              {/* Name */}
              <h3 className="relative mb-2 text-base font-bold text-white sm:text-lg">
                {cat.name}
              </h3>

              {/* Stats */}
              <div className="relative flex items-center gap-3 text-xs">
                <span className="text-white/40">{cat.questions} questions</span>
                <span
                  className="rounded-full px-2 py-0.5 font-medium"
                  style={{
                    color: cat.color,
                    background: `${cat.color}15`,
                  }}
                >
                  {cat.difficulty}
                </span>
              </div>

              {/* Hover arrow */}
              <div className="absolute bottom-5 right-5 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <ArrowRight size={16} style={{ color: cat.color }} />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
