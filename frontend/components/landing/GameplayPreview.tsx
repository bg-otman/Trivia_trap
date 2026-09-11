'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import { Check, X, Vote, Sparkles } from 'lucide-react';

type Phase = 'question' | 'answers' | 'bluffing' | 'voting' | 'reveal';

const answerCards = [
  { text: 'Jupiter', isCorrect: true, isBluff: false, player: 'You' },
  { text: 'Mercury', isCorrect: false, isBluff: false, player: 'Sarah' },
  { text: 'Saturn', isCorrect: false, isBluff: true, player: 'Mike' },
  { text: 'Venus', isCorrect: false, isBluff: true, player: 'Alex' },
];

const phaseOrder: Phase[] = ['question', 'answers', 'bluffing', 'voting', 'reveal'];

const phaseLabels: Record<Phase, string> = {
  question: 'ROUND 2 / 5',
  answers: 'SUBMIT YOUR ANSWER',
  bluffing: 'WHO IS BLUFFING?',
  voting: 'VOTE FOR THE BLUFF',
  reveal: 'THE TRAP WAS...',
};

export default function GameplayPreview() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [phase, setPhase] = useState<Phase>('question');
  const [selectedVote, setSelectedVote] = useState<number | null>(null);

  useEffect(() => {
    if (!inView || prefersReduced) return;
    let phaseIdx = 0;
    const interval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phaseOrder.length;
      setPhase(phaseOrder[phaseIdx]);
      if (phaseOrder[phaseIdx] === 'voting') {
        setSelectedVote(null);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [inView, prefersReduced]);

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-trap-cyan">
            Gameplay preview
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            See the game in action
          </h2>
        </motion.div>

        {/* Fake game interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-trap-navy-800/60 to-trap-navy-950/80 p-6 backdrop-blur-sm sm:p-8"
          style={{ boxShadow: '0 20px 80px rgba(0,0,0,0.4)' }}
        >
          {/* Phase indicator bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-trap-pink to-trap-purple text-xs font-bold text-white">
                TT
              </div>
              <span className="text-sm font-medium text-white/60">Trivia Trap</span>
            </div>
            <div className="flex gap-1.5">
              {phaseOrder.map((p) => (
                <div
                  key={p}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    p === phase ? 'w-8 bg-gradient-to-r from-trap-pink to-trap-cyan' : 'w-1.5 bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Phase label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3 text-center text-xs font-bold tracking-widest text-trap-cyan">
                {phaseLabels[phase]}
              </div>

              {/* Question phase */}
              {phase === 'question' && (
                <div className="text-center">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-500/15 px-4 py-1.5 text-sm font-medium text-purple-400">
                    <Sparkles size={14} /> Science
                  </div>
                  <h3 className="text-2xl font-bold text-white sm:text-3xl">
                    Which planet has the shortest day?
                  </h3>
                  <p className="mt-3 text-sm text-white/40">Everyone submits an answer — real or fake...</p>
                </div>
              )}

              {/* Answers phase */}
              {phase === 'answers' && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {answerCards.map((card, i) => (
                    <motion.div
                      key={card.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
                    >
                      <div className="text-lg font-bold text-white">{card.text}</div>
                      <div className="mt-1 text-xs text-white/40">— {card.player}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Bluffing phase */}
              {phase === 'bluffing' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="text-3xl sm:text-4xl">🤔</div>
                  <p className="text-center text-lg text-white/70">
                    Two of these answers are completely made up.
                    <br />
                    <span className="text-white/50">Can you spot the bluffs?</span>
                  </p>
                </div>
              )}

              {/* Voting phase */}
              {phase === 'voting' && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {answerCards.map((card, i) => (
                    <motion.button
                      key={card.text}
                      whileHover={prefersReduced ? {} : { scale: 1.04 }}
                      whileTap={prefersReduced ? {} : { scale: 0.96 }}
                      onClick={() => setSelectedVote(i)}
                      className={`relative rounded-xl border p-4 text-center transition-all duration-300 ${
                        selectedVote === i
                          ? 'border-trap-cyan bg-trap-cyan/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-lg font-bold text-white">{card.text}</div>
                      <div className="mt-1 text-xs text-white/40">— {card.player}</div>
                      {selectedVote === i && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-trap-cyan text-trap-navy-950"
                        >
                          <Vote size={12} strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Reveal phase */}
              {phase === 'reveal' && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {answerCards.map((card, i) => (
                    <motion.div
                      key={card.text}
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className={`relative rounded-xl border p-4 text-center ${
                        card.isCorrect
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : card.isBluff
                          ? 'border-red-500/40 bg-red-500/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="text-lg font-bold text-white">{card.text}</div>
                      <div className="mt-1 text-xs text-white/40">— {card.player}</div>
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs font-bold">
                        {card.isCorrect ? (
                          <span className="text-emerald-400">
                            <Check size={12} className="inline" /> Correct
                          </span>
                        ) : card.isBluff ? (
                          <span className="text-red-400">
                            <X size={12} className="inline" /> Bluff!
                          </span>
                        ) : (
                          <span className="text-white/30">Wrong</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom hint */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">
              {phase === 'question' && 'Watch how a round unfolds →'}
              {phase === 'answers' && 'Everyone has submitted their answer'}
              {phase === 'bluffing' && 'Time to figure out who\'s faking it'}
              {phase === 'voting' && 'Click an answer to cast your vote'}
              {phase === 'reveal' && 'Mike and Alex were bluffing! They lose points.'}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
