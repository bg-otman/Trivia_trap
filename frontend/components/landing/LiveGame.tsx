'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { livePlayers } from '@/lib/data';

export default function LiveGame() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-emerald-400">
            Live now
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            People are playing right now
          </h2>
        </motion.div>

        {/* Live players */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {livePlayers.map((player, i) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={prefersReduced ? {} : { y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-sm transition-colors hover:border-white/20"
            >
              {/* Avatar */}
              <div className="mb-3 flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${player.color} font-bold text-white shadow-lg`}
                    style={{ border: '2px solid rgba(255,255,255,0.1)' }}
                  >
                    {player.name.charAt(0)}
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-trap-navy-950 bg-emerald-400">
                    {!prefersReduced && (
                      <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-white">{player.name}</div>
                  <div className="text-xs text-white/40">In a room</div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <div className="flex gap-1">
                  {!prefersReduced && (
                    <>
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-white/40"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-white/40"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-white/40"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </>
                  )}
                </div>
                <span className={`text-xs font-medium ${player.statusColor}`}>
                  {player.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            {!prefersReduced && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-sm text-white/50">
            <span className="font-bold text-white">3,247</span> players online now
          </span>
        </motion.div>
      </div>
    </section>
  );
}
